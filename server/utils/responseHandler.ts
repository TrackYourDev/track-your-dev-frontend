import { NextResponse } from "next/server";

// Express used (res, message, data, statusCode) and wrote to the response.
// In Next.js route handlers we return a NextResponse instead, keeping the same
// JSON envelope shape ({ success, message, data } / { success, message, errors }).

export const successResponse = (
  message: string,
  data: any = {},
  statusCode: number = 200
): NextResponse => {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status: statusCode }
  );
};

export const errorResponse = (
  message: string,
  statusCode: number = 500,
  errors: any = null
): NextResponse => {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
    },
    { status: statusCode }
  );
};
