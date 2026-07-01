import { NextRequest } from "next/server";
import { toggleTasksEnabled } from "@/server/controllers/repository.controller";
import { errorResponse } from "@/server/utils/responseHandler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/toggle-tasks  (was: Express POST /api/toggle-tasks)
export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body", 400);
  }

  return toggleTasksEnabled(body);
}
