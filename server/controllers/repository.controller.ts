import { NextResponse } from "next/server";
import { connectDB } from "../db";
import { Repository } from "../models/repositories.model";
import { successResponse, errorResponse } from "../utils/responseHandler";

export async function toggleTasksEnabled(
  body: { repoId?: number; enabled?: boolean }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { repoId, enabled } = body;

    if (!repoId || typeof enabled !== "boolean") {
      return errorResponse(
        "Invalid request body. Required fields: repoId (string) and enabled (boolean)",
        400
      );
    }

    const updatedRepo = await Repository.findOneAndUpdate(
      { repoId },
      { enabledForTasks: enabled },
      { new: true }
    );

    if (!updatedRepo) {
      return errorResponse("Repository not found", 404);
    }

    return successResponse(
      `Tasks ${enabled ? "enabled" : "disabled"} for repository successfully`,
      { repository: updatedRepo },
      200
    );
  } catch (error) {
    console.error("Error toggling tasks enabled status:", error);
    return errorResponse("Failed to update repository", 500, error);
  }
}
