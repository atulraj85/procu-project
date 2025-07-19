# Error Handling Documentation

## Overview

This document explains how error handling is managed in the procurement project, including how errors flow from the API layer to the client/UI components and how error codes are mapped to user-friendly messages.

## Error Handling Architecture

### 1. Centralized Error Code Management (`src/lib/errorCodes.ts`)

The error handling system is built around a centralized error code management system that:

- **Standardizes error codes** across different layers (database, authentication, API, validation, business logic)
- **Maps error codes to user-friendly messages** for consistent UX
- **Provides HTTP status code mappings** for proper API responses
- **Handles error code transformations** (e.g., Prisma codes to standard codes)

#### Error Categories:
- **Database Errors**: Prisma error codes (P2002, P2025, etc.)
- **Authentication Errors**: NextAuth and JWT related errors
- **API/Client Errors**: Network, timeout, and HTTP errors
- **Validation Errors**: Form and input validation errors
- **Business Logic Errors**: Application-specific errors

### 2. API Layer Error Handling (`src/lib/response.ts`)

The API layer provides standardized response functions:

```typescript
// Standard error response with error code mapping
standardized_error_response(errorCode, details?, customMessage?)

// Database-specific error handling
database_error_response(prismaError, customMessage?)

// Authentication-specific error handling
auth_error_response(authError, customMessage?)
```

**Example API Route Usage:**
```typescript
// Before (in vendor route)
if (error.code === "P2002") {
  return NextResponse.json(
    { error: "A vendor with this unique field already exists." },
    { status: 409 }
  );
}

// After (using centralized system)
if (error.code) {
  return database_error_response(error);
}
```

### 3. Client-Side Error Handling (`src/service/apiService.ts`)

The client-side API service handles errors from the tunnel/client perspective:

#### Error Flow in Client Service:
1. **Network Request**: Makes HTTP request to API
2. **Error Detection**: Checks response status and error structure
3. **Error Code Mapping**: Uses centralized error codes to get user-friendly messages
4. **User Notification**: Shows toast notifications with appropriate error messages
5. **Special Handling**: JWT expiration triggers automatic logout and redirect

#### Key Functions:
- `handleJwtExpiration()`: Manages token expiration and logout
- `handleAuthenticationError()`: Processes auth-related errors
- `handleApiError()`: Maps API errors to user messages
- `handleNetworkError()`: Handles connection and network issues

### 4. Component Error Display

Error components display errors to users:

- **`FormError` component**: Displays form validation errors
- **`ErrorCard` component**: Shows general error pages
- **Toast notifications**: Immediate error feedback

## Error Code Mapping Examples

### Database Errors
```typescript
"P2002" → "UNIQUE_CONSTRAINT_VIOLATION" → "A record with this information already exists."
"P2025" → "RECORD_NOT_FOUND" → "The requested record was not found."
```

### Authentication Errors
```typescript
"CredentialsSignin" → "INVALID_CREDENTIALS" → "Invalid email or password..."
"jwt expired" → "TOKEN_EXPIRED" → "Your session has expired..."
```

### API Errors
```typescript
Network timeout → "REQUEST_TIMEOUT" → "The request took too long to complete..."
HTTP 404 → "RECORD_NOT_FOUND" → "The requested record was not found."
```

## Error Flow Diagram

```
API Route (error occurs)
    ↓
Error Code Detection
    ↓
Centralized Error Mapping (errorCodes.ts)
    ↓
Standardized Response (response.ts)
    ↓
Client API Service (apiService.ts)
    ↓
Error Code to Message Mapping
    ↓
User Notification (Toast/Component)
```

## How to Use the Error System

### In API Routes

```typescript
import { standardized_error_response, database_error_response } from "@/lib/response";
import { VALIDATION_ERROR_CODES } from "@/lib/errorCodes";

// For validation errors
if (!requiredField) {
  return standardized_error_response(
    VALIDATION_ERROR_CODES.FIELD_REQUIRED,
    { field: "requiredField" },
    "Custom message if needed"
  );
}

// For database errors
catch (error: any) {
  if (error.code) {
    return database_error_response(error);
  }
}
```

### In Server Actions

```typescript
import { getErrorMessage, AUTH_ERROR_CODES } from "@/lib/errorCodes";

// Return structured error objects
return {
  error: getErrorMessage(AUTH_ERROR_CODES.INVALID_CREDENTIALS),
  errorCode: AUTH_ERROR_CODES.INVALID_CREDENTIALS
};
```

### In Client Components

```typescript
import { apiCall } from "@/service/apiService";

// Use the enhanced API service
const { data, error } = await apiCall<VendorData[]>("/api/vendor");
if (error) {
  // Error handling is automatic via toast notifications
  return;
}
```

## Benefits of Centralized Error Handling

1. **Consistency**: All errors follow the same format and messaging
2. **Maintainability**: Error messages can be updated in one place
3. **Internationalization Ready**: Easy to add multi-language support
4. **Better UX**: User-friendly messages instead of technical error codes
5. **Debugging**: Detailed error information preserved for development
6. **Type Safety**: TypeScript ensures proper error code usage

## Error Response Format

### API Response Structure
```typescript
{
  response: {
    meta: {
      success: false,
      message: "User-friendly error message",
      errorCode: "STANDARDIZED_ERROR_CODE"
    },
    data: null,
    error: {
      code: "STANDARDIZED_ERROR_CODE",
      message: "User-friendly error message",
      details: { /* additional error context */ },
      timestamp: "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Client Error Object
```typescript
{
  code: "ERROR_CODE",
  message: "User-friendly message",
  details: { /* context */ },
  timestamp: "ISO string"
}
```

## Troubleshooting Common Issues

### "Error message not showing properly"
- Check if error code exists in `ERROR_MESSAGES` mapping
- Verify API response includes proper error structure
- Ensure client service is using `getErrorMessage()` function

### "JWT expiration not redirecting"
- Check token storage key matches between components
- Verify JWT error detection in `apiService.ts`
- Ensure redirect URL is accessible

### "Database errors showing technical messages"
- Use `database_error_response()` instead of generic error response
- Check if Prisma error codes are mapped in `DATABASE_ERROR_CODES`
- Add new database error codes as needed