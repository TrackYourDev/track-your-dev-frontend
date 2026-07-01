import { NextRequest } from "next/server";
import { verifyGithubSignature } from "@/server/middleware/verifyWebhook";
import { handleGitHubWebhook } from "@/server/controllers/webhook.controller";
import { errorResponse } from "@/server/utils/responseHandler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/webhook  (was: Express POST /api/webhook)
export async function POST(request: NextRequest) {
  // Read the raw body so the HMAC signature is verified against the exact bytes.
  const rawBody = await request.text();

  const verification = verifyGithubSignature(request, rawBody);
  if (verification) return verification;

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return errorResponse("Invalid JSON payload", 400);
  }

  return handleGitHubWebhook(payload);
}
