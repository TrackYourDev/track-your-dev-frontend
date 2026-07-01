# Backend → Next.js migration

The standalone Express backend (`track-your-dev-backend`, aka `gitradar`) has been
migrated into this Next.js app. The app is now a single, self-contained repo: the
frontend calls its own `/api` routes instead of a separate Express server.

## What moved where

All backend business logic lives in one folder: **`server/`** (models, services,
utils, config, middleware, controllers). Next.js route handlers under `app/api/**`
are thin adapters that parse the request, run auth/verification, and delegate to
`server/controllers/*`.

```
server/
├── config.ts                 # env constants (was src/config/dotenv.config.ts)
├── db.ts                     # Mongoose connect, cached on global for serverless
├── types.ts                  # was src/types/index.types.ts
├── models/                   # Mongoose models, guarded against re-registration
├── services/                 # github, githubPreview, groq, openai, subscription, user
├── utils/                    # fileFilter, generateJWT, mailer, responseHandler
├── middleware/
│   ├── auth.ts               # authenticateGithub() — replaces authenticateToken
│   └── verifyWebhook.ts      # verifyGithubSignature() — replaces verifyGithubAppWebhook
└── controllers/              # each returns a NextResponse
```

## Endpoint mapping

| Express route                          | Next.js route file                                  | Method |
| -------------------------------------- | --------------------------------------------------- | ------ |
| `POST /api/webhook`                    | `app/api/webhook/route.ts`                          | POST   |
| `POST /api/waitlist`                   | `app/api/waitlist/route.ts`                         | POST   |
| `GET  /api/userinfo`                   | `app/api/userinfo/route.ts`                         | GET    |
| `GET  /api/commits/:orgName/:repoName` | `app/api/commits/[orgName]/[repoName]/route.ts`     | GET    |
| `GET  /api/preview`                    | `app/api/preview/route.ts`                          | GET    |
| `GET  /api/:orgName/dates`             | `app/api/[orgName]/dates/route.ts`                  | GET    |
| `POST /api/toggle-tasks`               | `app/api/toggle-tasks/route.ts`                     | POST   |
| `setInterval` scheduler                | `app/api/cron/update-subscriptions/route.ts`        | GET    |

The API surface (`/api/...`) and JSON envelope (`{ success, message, data }`) are
unchanged, so existing frontend calls keep working.

## Key adaptations for Next.js

- **DB connections** are cached on `global` (`server/db.ts`) so warm serverless
  containers and dev hot-reload reuse a single Mongoose connection.
- **Models** use `mongoose.models.X || model('X', ...)` to avoid
  `OverwriteModelError` on hot reload.
- **Auth** (`authenticateToken`) became `authenticateGithub(request)` returning a
  discriminated result; routes map it to the original 401/403 responses.
- **Webhook verification** now hashes the **raw** request body (`await request.text()`),
  which is more correct than the Express version that re-stringified the parsed body.
- **Response helpers** return `NextResponse.json(...)` instead of writing to `res`.
- **Groq** calls switched from streaming to non-streaming (same result — the code
  already buffered the whole stream into a string).
- **`generateJWT`** resolves the private key lazily so importing it never crashes
  the build when no key/PEM is present.
- **Scheduler**: the hourly `setInterval` can't run in serverless. It's now a
  cron-triggered route. `vercel.json` schedules it hourly; secure it with `CRON_SECRET`.

## Frontend rewiring

`services/apis/baseUrl.ts` now defaults to same-origin (`''`), so `axiosInstance`
hits this app's own `/api` routes. Set `NEXT_PUBLIC_API_BASE_URL` only to target a
different host. CORS is no longer needed (same origin).

## Environment variables

See `.env.example`. Copy it to `.env.local` for local dev. Note the GitHub App id
is hard-coded in `server/utils/generateJWT.ts` (`1265874`) as in the original.

## Build note

`next build` passes with full type-checking and page-data collection enabled; the
migrated code is type-clean (`tsc --noEmit` reports 0 errors across the project).
`next.config.js` also marks `mongoose` and `nodemailer` as
`serverComponentsExternalPackages` so their optional native/lazy deps aren't bundled.

One benign build warning remains: `groq-sdk` → `node-fetch` references the optional
`encoding` package. It does not affect the build; install `encoding` if you want it gone.

## Known caveats carried over from the original (behavior preserved, not fixed)

- `GET /api/userinfo` queries `Organization.find({ users: ... })`, but the schema
  field is `members` — so it returns "No organizations found". Left as-is
  (this endpoint isn't called by the current frontend).
- `GET /api/commits/:org/:repo` with a `startDate`+`endDate` range and no cached
  commits was never implemented upstream (the Express handler returned nothing and
  hung). Here it safely returns an empty result instead of hanging. The default
  paginated path (used by the dashboard) is fully implemented.
