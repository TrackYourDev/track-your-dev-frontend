import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { WEBHOOK_SECRET } from "../config";
import { errorResponse } from "../utils/responseHandler";

// Verifies a GitHub App webhook signature. Unlike the Express version (which
// re-stringified the already-parsed body), this validates the HMAC against the
// exact raw request body — the correct and reliable approach. Returns an error
// NextResponse on failure, or null when the signature is valid.
export function verifyGithubSignature(
  request: NextRequest,
  rawBody: string
): NextResponse | null {
  try {
    const signature = request.headers.get("x-hub-signature-256");
    const installationId = request.headers.get(
      "x-github-hook-installation-target-id"
    );
    const deliveryId = request.headers.get("x-github-delivery");
    const event = request.headers.get("x-github-event");

    if (!signature) return errorResponse("Missing X-Hub-Signature-256", 401);
    if (!installationId) return errorResponse("Missing Installation ID", 401);
    if (!deliveryId) return errorResponse("Missing Delivery ID", 401);
    if (!event) return errorResponse("Missing Event Type", 401);

    if (!rawBody) {
      return errorResponse("Empty payload", 400);
    }

    const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
    const digest = `sha256=${hmac.update(rawBody).digest("hex")}`;

    const signatureBuffer = Buffer.from(signature, "utf8");
    const digestBuffer = Buffer.from(digest, "utf8");

    // timingSafeEqual throws if the buffers differ in length, so guard first.
    if (
      signatureBuffer.length !== digestBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, digestBuffer)
    ) {
      return errorResponse("Invalid signature", 401);
    }

    return null;
  } catch (error) {
    console.error("Webhook verification error:", {
      error: error instanceof Error ? error.stack : error,
    });
    return errorResponse("Webhook verification failed", 500, error);
  }
}
