import { NextRequest } from "next/server";
import { authenticateGithub } from "@/server/middleware/auth";
import { getCommitsController } from "@/server/controllers/commits.controller";
import { errorResponse } from "@/server/utils/responseHandler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/commits/:orgName/:repoName  (was: Express GET /api/commits/:orgName/:repoName, authenticateToken)
export async function GET(
  request: NextRequest,
  { params }: { params: { orgName: string; repoName: string } }
) {
  const auth = await authenticateGithub(request);
  if (!auth.ok) return errorResponse(auth.message, auth.status);

  const { searchParams } = new URL(request.url);

  return getCommitsController(params.orgName, params.repoName, {
    startDate: searchParams.get("startDate") ?? undefined,
    endDate: searchParams.get("endDate") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });
}
