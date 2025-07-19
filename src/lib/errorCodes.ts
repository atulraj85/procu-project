/**
 * Centralized Error Code Management System
 * 
 * This module provides standardized error codes and messages for the procurement system.
 * It handles various types of errors including database, authentication, validation, and API errors.
 */

// Database Error Codes (Prisma/Database specific)
export const DATABASE_ERROR_CODES = {
  P2002: "UNIQUE_CONSTRAINT_VIOLATION",
  P2025: "RECORD_NOT_FOUND",
  P2003: "FOREIGN_KEY_CONSTRAINT_VIOLATION",
  P2014: "RELATION_VIOLATION",
  P2016: "QUERY_INTERPRETATION_ERROR",
  P2021: "TABLE_NOT_EXISTS",
  P2022: "COLUMN_NOT_EXISTS",
} as const;

// Authentication Error Codes
export const AUTH_ERROR_CODES = {
  CREDENTIALS_SIGNIN: "INVALID_CREDENTIALS",
  INVALID_EMAIL: "EMAIL_NOT_FOUND",
  EMAIL_NOT_VERIFIED: "EMAIL_VERIFICATION_REQUIRED",
  JWT_EXPIRED: "TOKEN_EXPIRED",
  UNAUTHORIZED: "UNAUTHORIZED_ACCESS",
  FORBIDDEN: "INSUFFICIENT_PERMISSIONS",
} as const;

// API/Client Error Codes
export const API_ERROR_CODES = {
  NETWORK_ERROR: "NETWORK_CONNECTION_FAILED",
  TIMEOUT: "REQUEST_TIMEOUT",
  INVALID_REQUEST: "INVALID_REQUEST_FORMAT",
  RATE_LIMITED: "RATE_LIMIT_EXCEEDED",
  SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_TEMPORARILY_UNAVAILABLE",
} as const;

// Validation Error Codes
export const VALIDATION_ERROR_CODES = {
  REQUIRED_FIELD: "FIELD_REQUIRED",
  INVALID_FORMAT: "INVALID_FORMAT",
  INVALID_EMAIL_FORMAT: "INVALID_EMAIL_FORMAT",
  INVALID_PHONE_FORMAT: "INVALID_PHONE_FORMAT",
  INVALID_GST_FORMAT: "INVALID_GST_FORMAT",
  INVALID_PIN_CODE: "INVALID_PIN_CODE",
  INVALID_ZIP_CODE: "INVALID_ZIP_CODE",
} as const;

// Business Logic Error Codes
export const BUSINESS_ERROR_CODES = {
  VENDOR_ALREADY_EXISTS: "VENDOR_DUPLICATE",
  RFP_NOT_FOUND: "RFP_NOT_FOUND",
  VENDOR_NOT_FOUND: "VENDOR_NOT_FOUND",
  COMPANY_NOT_FOUND: "COMPANY_NOT_FOUND",
  INVALID_STATUS_TRANSITION: "INVALID_STATUS_CHANGE",
  INSUFFICIENT_INVENTORY: "INSUFFICIENT_STOCK",
} as const;

// Combine all error codes
export const ERROR_CODES = {
  ...DATABASE_ERROR_CODES,
  ...AUTH_ERROR_CODES,
  ...API_ERROR_CODES,
  ...VALIDATION_ERROR_CODES,
  ...BUSINESS_ERROR_CODES,
} as const;

// Error Messages Mapping
export const ERROR_MESSAGES = {
  // Database Errors
  UNIQUE_CONSTRAINT_VIOLATION: "A record with this information already exists.",
  RECORD_NOT_FOUND: "The requested record was not found.",
  FOREIGN_KEY_CONSTRAINT_VIOLATION: "Cannot perform this operation due to related data constraints.",
  RELATION_VIOLATION: "This operation would violate data relationships.",
  QUERY_INTERPRETATION_ERROR: "Unable to process the request. Please try again.",
  TABLE_NOT_EXISTS: "System error: Required data table not found.",
  COLUMN_NOT_EXISTS: "System error: Required data field not found.",

  // Authentication Errors
  INVALID_CREDENTIALS: "Invalid email or password. Please check your credentials and try again.",
  EMAIL_NOT_FOUND: "No account found with this email address.",
  EMAIL_VERIFICATION_REQUIRED: "Please verify your email address before logging in.",
  TOKEN_EXPIRED: "Your session has expired. Please log in again.",
  UNAUTHORIZED_ACCESS: "You are not authorized to access this resource.",
  INSUFFICIENT_PERMISSIONS: "You don't have permission to perform this action.",

  // API/Client Errors
  NETWORK_CONNECTION_FAILED: "Unable to connect to the server. Please check your internet connection.",
  REQUEST_TIMEOUT: "The request took too long to complete. Please try again.",
  INVALID_REQUEST_FORMAT: "The request format is invalid. Please check your input.",
  RATE_LIMIT_EXCEEDED: "Too many requests. Please wait a moment before trying again.",
  INTERNAL_SERVER_ERROR: "An internal server error occurred. Please try again later.",
  SERVICE_TEMPORARILY_UNAVAILABLE: "The service is temporarily unavailable. Please try again later.",

  // Validation Errors
  FIELD_REQUIRED: "This field is required.",
  INVALID_FORMAT: "The format of this field is invalid.",
  INVALID_EMAIL_FORMAT: "Please enter a valid email address.",
  INVALID_PHONE_FORMAT: "Please enter a valid phone number.",
  INVALID_GST_FORMAT: "Please enter a valid GST number.",
  INVALID_PIN_CODE: "Please enter a valid PIN code.",
  INVALID_ZIP_CODE: "Please enter a valid ZIP code.",

  // Business Logic Errors
  VENDOR_DUPLICATE: "A vendor with this information already exists.",
  RFP_NOT_FOUND: "The requested RFP was not found.",
  VENDOR_NOT_FOUND: "The requested vendor was not found.",
  COMPANY_NOT_FOUND: "The requested company was not found.",
  INVALID_STATUS_CHANGE: "This status change is not allowed.",
  INSUFFICIENT_STOCK: "Insufficient inventory for this operation.",
} as const;

// Type definitions
export type ErrorCodeType = keyof typeof ERROR_CODES;
export type ErrorMessageType = keyof typeof ERROR_MESSAGES;

/**
 * Get error message from error code
 * @param errorCode - The error code to get message for
 * @returns The human-readable error message
 */
export function getErrorMessage(errorCode: string): string {
  // First try to find direct error code mapping
  if (errorCode in ERROR_MESSAGES) {
    return ERROR_MESSAGES[errorCode as ErrorMessageType];
  }

  // Check if it's a Prisma error code and map it
  if (errorCode in DATABASE_ERROR_CODES) {
    const mappedCode = DATABASE_ERROR_CODES[errorCode as keyof typeof DATABASE_ERROR_CODES];
    return ERROR_MESSAGES[mappedCode];
  }

  // Default fallback message
  return "An unexpected error occurred. Please try again.";
}

/**
 * Map Prisma error code to standard error code
 * @param prismaCode - The Prisma error code (e.g., "P2002")
 * @returns Mapped error code
 */
export function mapPrismaErrorCode(prismaCode: string): string {
  return DATABASE_ERROR_CODES[prismaCode as keyof typeof DATABASE_ERROR_CODES] || "UNKNOWN_DATABASE_ERROR";
}

/**
 * Map Auth error type to standard error code
 * @param authErrorType - The auth error type from NextAuth
 * @returns Mapped error code
 */
export function mapAuthErrorCode(authErrorType: string): string {
  switch (authErrorType) {
    case "CredentialsSignin":
      return AUTH_ERROR_CODES.CREDENTIALS_SIGNIN;
    default:
      return AUTH_ERROR_CODES.UNAUTHORIZED;
  }
}

/**
 * Create standardized error object
 * @param errorCode - The error code
 * @param details - Additional error details (optional)
 * @returns Standardized error object
 */
export function createErrorObject(errorCode: string, details?: any) {
  return {
    code: errorCode,
    message: getErrorMessage(errorCode),
    details,
    timestamp: new Date().toISOString(),
  };
}

/**
 * HTTP Status Code mapping for different error types
 */
export const ERROR_HTTP_STATUS = {
  // Database Errors
  UNIQUE_CONSTRAINT_VIOLATION: 409,
  RECORD_NOT_FOUND: 404,
  FOREIGN_KEY_CONSTRAINT_VIOLATION: 400,
  RELATION_VIOLATION: 400,

  // Authentication Errors
  INVALID_CREDENTIALS: 401,
  EMAIL_NOT_FOUND: 404,
  EMAIL_VERIFICATION_REQUIRED: 403,
  TOKEN_EXPIRED: 401,
  UNAUTHORIZED_ACCESS: 401,
  INSUFFICIENT_PERMISSIONS: 403,

  // API/Client Errors
  INVALID_REQUEST_FORMAT: 400,
  RATE_LIMIT_EXCEEDED: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_TEMPORARILY_UNAVAILABLE: 503,

  // Validation Errors
  FIELD_REQUIRED: 400,
  INVALID_FORMAT: 400,
  INVALID_EMAIL_FORMAT: 400,
  INVALID_PHONE_FORMAT: 400,
  INVALID_GST_FORMAT: 400,
  INVALID_PIN_CODE: 400,
  INVALID_ZIP_CODE: 400,

  // Business Logic Errors
  VENDOR_DUPLICATE: 409,
  RFP_NOT_FOUND: 404,
  VENDOR_NOT_FOUND: 404,
  COMPANY_NOT_FOUND: 404,
  INVALID_STATUS_CHANGE: 400,
  INSUFFICIENT_STOCK: 400,
} as const;

/**
 * Get HTTP status code for error
 * @param errorCode - The error code
 * @returns HTTP status code
 */
export function getErrorHttpStatus(errorCode: string): number {
  return ERROR_HTTP_STATUS[errorCode as keyof typeof ERROR_HTTP_STATUS] || 500;
}

/**
 * Utility for extracting error information from different error formats
 */
export function extractErrorInfo(error: any): { code?: string; message?: string; details?: any } {
  // Handle standardized error response
  if (error?.response?.error) {
    return {
      code: error.response.error.code,
      message: error.response.error.message,
      details: error.response.error.details,
    };
  }

  // Handle API meta error
  if (error?.response?.meta) {
    return {
      code: error.response.meta.errorCode,
      message: error.response.meta.message,
    };
  }

  // Handle direct error object
  if (error?.code || error?.message) {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
    };
  }

  // Handle string error
  if (typeof error === "string") {
    return { message: error };
  }

  // Handle Error instance
  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: "An unknown error occurred" };
}

/**
 * Utility for consistent error logging
 */
export function logError(error: any, context?: string) {
  const errorInfo = extractErrorInfo(error);
  console.error(`[${context || "ERROR"}]`, {
    ...errorInfo,
    timestamp: new Date().toISOString(),
    context,
  });
}