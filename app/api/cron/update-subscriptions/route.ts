import { NextRequest } from "next/server";
import { connectDB } from "@/server/db";
import { updateExpiredSubscriptions } from "@/server/services/subscription.service";
import { successResponse, errorResponse } from "@/server/utils/responseHandler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Replacement for the old Express setInterval scheduler (which cannot run in a
// serverless environment). Trigger this on a schedule instead — e.g. Vercel Cron
// (see vercel.json) or any external cron hitting GET /api/cron/update-subscriptions.
export async function GET(request: NextRequest) {
  // Optional shared-secret guard. Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return errorResponse("Unauthorized", 401);
    }
  }

  try {
    await connectDB();
    const result = await updateExpiredSubscriptions();
    return successResponse(
      "Expired subscriptions updated",
      { modifiedCount: result.modifiedCount },
      200
    );
  } catch (error) {
    return errorResponse("Failed to update subscriptions", 500, error);
  }
}
