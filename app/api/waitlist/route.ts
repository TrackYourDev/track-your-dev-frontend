import { NextRequest } from "next/server";
import { joinWaitlist } from "@/server/controllers/waitlist.controller";
import { errorResponse } from "@/server/utils/responseHandler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/waitlist  (was: Express POST /api/waitlist)
export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body", 400);
  }

  return joinWaitlist(body);
}
