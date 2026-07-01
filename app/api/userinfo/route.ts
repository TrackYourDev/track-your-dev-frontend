import { NextRequest } from "next/server";
import { authenticateGithub } from "@/server/middleware/auth";
import { getUserInfoController } from "@/server/controllers/userInfo.controller";
import { errorResponse } from "@/server/utils/responseHandler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/userinfo  (was: Express GET /api/userinfo, authenticateToken)
export async function GET(request: NextRequest) {
  const auth = await authenticateGithub(request);
  if (!auth.ok) return errorResponse(auth.message, auth.status);

  return getUserInfoController(auth.githubId);
}
