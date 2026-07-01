import { NextRequest } from "next/server";
import { authenticateGithub } from "@/server/middleware/auth";
import { getDatesToProcess } from "@/server/controllers/dates.controller";
import { errorResponse } from "@/server/utils/responseHandler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/:orgName/dates  (was: Express GET /api/:orgName/dates, authenticateToken)
export async function GET(
  request: NextRequest,
  { params }: { params: { orgName: string } }
) {
  const auth = await authenticateGithub(request);
  if (!auth.ok) return errorResponse(auth.message, auth.status);

  return getDatesToProcess(params.orgName);
}
