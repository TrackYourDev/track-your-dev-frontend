import { NextRequest } from "next/server";
import { authenticateGithub } from "@/server/middleware/auth";
import { syncAndGetData } from "@/server/controllers/preview.controller";
import { errorResponse } from "@/server/utils/responseHandler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/preview  (was: Express GET /api/preview, authenticateToken)
export async function GET(request: NextRequest) {
  const auth = await authenticateGithub(request);
  if (!auth.ok) return errorResponse(auth.message, auth.status);

  const githubToken = request.cookies.get("github_token")?.value;

  return syncAndGetData(auth.githubId, githubToken);
}
