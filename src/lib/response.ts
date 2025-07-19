import { NextResponse } from "next/server";
import { getErrorMessage, getErrorHttpStatus, createErrorObject } from "./errorCodes";

const success_response = (
  data: any,
  message: string = "Success",
  code = 200
) => {
  const response = {
    meta: {
      success: true,
      message,
    },
    data,
  };
  return NextResponse.json({ response }, { status: code });
};

const error_response = (
  message: string = "Error",
  code = 400,
  data: any = null
) => {
  const response = {
    meta: {
      success: false,
      message,
    },
    data,
  };
  return NextResponse.json({ response }, { status: code });
};

/**
 * Enhanced error response using standardized error codes
 * @param errorCode - Standardized error code from errorCodes.ts
 * @param details - Additional error details (optional)
 * @param customMessage - Custom message to override default (optional)
 * @returns NextResponse with standardized error format
 */
const standardized_error_response = (
  errorCode: string,
  details?: any,
  customMessage?: string
) => {
  const httpStatus = getErrorHttpStatus(errorCode);
  const message = customMessage || getErrorMessage(errorCode);
  const errorObject = createErrorObject(errorCode, details);

  const response = {
    meta: {
      success: false,
      message,
      errorCode,
    },
    data: null,
    error: errorObject,
  };

  return NextResponse.json({ response }, { status: httpStatus });
};

/**
 * Database error response with Prisma error code mapping
 * @param prismaError - Prisma error object with code property
 * @param customMessage - Custom message to override default (optional)
 * @returns NextResponse with mapped error
 */
const database_error_response = (
  prismaError: { code?: string; message?: string },
  customMessage?: string
) => {
  if (prismaError.code) {
    return standardized_error_response(prismaError.code, prismaError.message, customMessage);
  }
  
  // Fallback for errors without code
  return error_response(customMessage || prismaError.message || "Database error occurred", 500);
};

/**
 * Authentication error response with NextAuth error mapping
 * @param authError - Authentication error from NextAuth
 * @param customMessage - Custom message to override default (optional)
 * @returns NextResponse with mapped error
 */
const auth_error_response = (
  authError: { type?: string; message?: string },
  customMessage?: string
) => {
  const errorCode = authError.type === "CredentialsSignin" ? "INVALID_CREDENTIALS" : "UNAUTHORIZED_ACCESS";
  return standardized_error_response(errorCode, authError.message, customMessage);
};

export { 
  success_response, 
  error_response, 
  standardized_error_response,
  database_error_response,
  auth_error_response
};
