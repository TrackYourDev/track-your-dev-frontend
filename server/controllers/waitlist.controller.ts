import { NextResponse } from "next/server";
import { connectDB } from "../db";
import Waitlist from "../models/waitlist.model";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { sendWaitlistEmail } from "../utils/mailer";

export const joinWaitlist = async (
  body: { email?: string }
): Promise<NextResponse> => {
  const { email } = body;

  if (!email) return errorResponse("Email is required", 400);

  try {
    await connectDB();

    const exists = await Waitlist.findOne({ email });
    if (exists) return errorResponse("Email already exists in the waitlist", 400);
    const waitlistEntry = await Waitlist.create({ email });
    await sendWaitlistEmail(email);
    return successResponse("Successfully joined the waitlist", waitlistEntry, 201);
  } catch (err: any) {
    console.error("Waitlist error:", err);
    return errorResponse("Failed to join the waitlist", 500, err);
  }
};
