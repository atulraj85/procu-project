import { toast } from "@/components/ui/use-toast";
import { getErrorMessage, API_ERROR_CODES, AUTH_ERROR_CODES } from "@/lib/errorCodes";

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
  method?: RequestMethod;
  body?: any;
}

interface ApiErrorResponse {
  response?: {
    meta?: {
      message?: string;
      errorCode?: string;
    };
    error?: {
      code: string;
      message: string;
      details?: any;
    };
  };
}

/**
 * Enhanced API service with centralized error handling
 * Handles network requests, authentication, and error mapping
 */
async function makeApiCallService<T>(
  url: string,
  options: RequestOptions = {}
): Promise<T | void> {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Include Bearer token in the Authorization header if provided
    const localStorageToken = localStorage.getItem("TOKEN");
    if (localStorageToken) {
      headers["Authorization"] = `Bearer ${localStorageToken}`;
    }

    const response = await fetch(url, {
      method: options.method || "GET",
      headers,
      body: JSON.stringify(options.body),
    });

    if (!response.ok) {
      const res: ApiErrorResponse = await response.json();
      
      // Handle specific error scenarios
      const errorCode = res?.response?.error?.code || res?.response?.meta?.errorCode;
      const errorMessage = res?.response?.error?.message || res?.response?.meta?.message;

      // Handle JWT expiration specifically
      if (errorMessage === "jwt expired" || errorCode === AUTH_ERROR_CODES.JWT_EXPIRED) {
        handleJwtExpiration();
        return;
      }

      // Handle authentication errors
      if (response.status === 401) {
        handleAuthenticationError(errorCode, errorMessage);
        return;
      }

      // Handle other API errors with centralized mapping
      handleApiError(errorCode, errorMessage, response.status);
      return;
    }

    const data: T = await response.json();
    return data;
  } catch (error) {
    handleNetworkError(error);
    return;
  }
}

/**
 * Handle JWT token expiration
 */
function handleJwtExpiration() {
  toast({
    variant: "destructive",
    title: "Session Expired",
    description: getErrorMessage(AUTH_ERROR_CODES.JWT_EXPIRED),
  });
  
  // Clear token and redirect to login
  localStorage.removeItem("TOKEN");
  window.location.replace("/login");
}

/**
 * Handle authentication errors
 */
function handleAuthenticationError(errorCode?: string, errorMessage?: string) {
  const message = errorCode ? getErrorMessage(errorCode) : errorMessage || "Authentication failed";
  
  toast({
    variant: "destructive",
    title: "Authentication Error",
    description: message,
  });
}

/**
 * Handle general API errors with centralized mapping
 */
function handleApiError(errorCode?: string, errorMessage?: string, httpStatus?: number) {
  let title = "API Error";
  let description = errorMessage || "An error occurred";

  // Use centralized error mapping if error code is available
  if (errorCode) {
    description = getErrorMessage(errorCode);
  }

  // Provide better titles based on HTTP status
  switch (httpStatus) {
    case 400:
      title = "Invalid Request";
      break;
    case 403:
      title = "Access Denied";
      break;
    case 404:
      title = "Not Found";
      break;
    case 409:
      title = "Conflict";
      break;
    case 429:
      title = "Too Many Requests";
      break;
    case 500:
      title = "Server Error";
      break;
    case 503:
      title = "Service Unavailable";
      break;
  }

  toast({
    variant: "destructive",
    title,
    description,
  });
}

/**
 * Handle network/connection errors
 */
function handleNetworkError(error: unknown) {
  const errorMessage = ((error as unknown) as any)?.message;
  let description = getErrorMessage(API_ERROR_CODES.NETWORK_ERROR);

  // Provide more specific error messages for common network issues
  if (errorMessage) {
    if (errorMessage.includes("timeout")) {
      description = getErrorMessage(API_ERROR_CODES.TIMEOUT);
    } else if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      description = getErrorMessage(API_ERROR_CODES.NETWORK_ERROR);
    }
  }

  toast({
    variant: "destructive",
    title: "Connection Error",
    description: `${description} ${errorMessage ? `(${errorMessage})` : ''}`,
  });
}

/**
 * Type-safe wrapper for API calls with better error handling
 */
export async function apiCall<T>(
  url: string,
  options: RequestOptions = {}
): Promise<{ data?: T; error?: string }> {
  try {
    const result = await makeApiCallService<T>(url, options);
    if (result) {
      return { data: result };
    }
    return { error: "Request failed" };
  } catch (error) {
    return { error: "Network error occurred" };
  }
}

export default makeApiCallService;
