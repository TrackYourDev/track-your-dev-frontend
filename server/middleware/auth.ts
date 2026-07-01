import { NextRequest } from "next/server";

// Express used an `authenticateToken` middleware that read the `github_token`
// cookie, verified it against the GitHub API and attached `req.githubId`.
// In Next.js route handlers there is no `next()`, so this helper instead returns
// a discriminated result the route can act on (200 -> proceed, otherwise return
// the given status/message), preserving the original status codes.

export type AuthResult =
  | { ok: true; githubId: number }
  | { ok: false; status: number; message: string };

export async function authenticateGithub(request: NextRequest): Promise<AuthResult> {
  const token = request.cookies.get("github_token")?.value;
  if (!token) {
    return { ok: false, status: 401, message: "No token provided" };
  }

  try {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "trackyourdev",
      },
    });

    if (response.ok) {
      const userData = await response.json();
      return { ok: true, githubId: userData.id };
    }

    return { ok: false, status: 401, message: "Invalid token" };
  } catch (err) {
    return { ok: false, status: 403, message: "Invalid token" };
  }
}
