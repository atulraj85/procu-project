/**
 * Error Handling Utilities
 * 
 * This module provides utility functions and hooks for handling errors
 * in React components, forms, and other client-side code.
 */

import React, { useState, useCallback } from "react";
import { toast } from "@/components/ui/use-toast";
import { getErrorMessage, createErrorObject } from "./errorCodes";

// Types for error handling
export interface ErrorState {
  hasError: boolean;
  errorCode?: string;
  message?: string;
  details?: any;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

/**
 * Hook for managing error state in components
 */
export function useErrorHandler() {
  const [error, setError] = useState<ErrorState>({ hasError: false });

  const handleError = useCallback((errorCode: string, details?: any, customMessage?: string) => {
    const message = customMessage || getErrorMessage(errorCode);
    const errorObject = createErrorObject(errorCode, details);
    
    setError({
      hasError: true,
      errorCode,
      message,
      details: errorObject.details,
    });

    // Show toast notification
    toast({
      variant: "destructive",
      title: "Error",
      description: message,
    });
  }, []);

  const clearError = useCallback(() => {
    setError({ hasError: false });
  }, []);

  const handleSuccess = useCallback((message: string = "Operation completed successfully") => {
    clearError();
    toast({
      title: "Success",
      description: message,
    });
  }, [clearError]);

  return {
    error,
    handleError,
    clearError,
    handleSuccess,
  };
}

/**
 * Hook for managing form errors with validation
 */
export function useFormErrors<T = Record<string, any>>() {
  const [errors, setErrors] = useState<FormErrors>({});

  const setFieldError = useCallback((field: string, errorCode: string, customMessage?: string) => {
    const message = customMessage || getErrorMessage(errorCode);
    setErrors(prev => ({
      ...prev,
      [field]: message,
    }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const hasErrors = Object.keys(errors).length > 0;

  const validateField = useCallback((field: string, value: any, validators: FieldValidator[]) => {
    for (const validator of validators) {
      const validationResult = validator(value);
      if (!validationResult.isValid) {
        setFieldError(field, validationResult.errorCode || "INVALID_FORMAT", validationResult.message);
        return false;
      }
    }
    clearFieldError(field);
    return true;
  }, [setFieldError, clearFieldError]);

  return {
    errors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    hasErrors,
    validateField,
  };
}

/**
 * Utility for handling API responses with error checking
 */
export function handleApiResponse<T>(response: any): { data?: T; error?: string; errorCode?: string } {
  if (response?.response?.meta?.success === false) {
    return {
      error: response.response.meta.message || response.response.error?.message,
      errorCode: response.response.meta.errorCode || response.response.error?.code,
    };
  }

  if (response?.response?.data) {
    return { data: response.response.data };
  }

  return { data: response };
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
 * Field validator interface and common validators
 */
export interface FieldValidator {
  (value: any): { isValid: boolean; errorCode?: string; message?: string };
}

export const validators = {
  required: (customMessage?: string): FieldValidator => (value) => ({
    isValid: value !== null && value !== undefined && value !== "",
    errorCode: "FIELD_REQUIRED",
    message: customMessage,
  }),

  email: (customMessage?: string): FieldValidator => (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      isValid: !value || emailRegex.test(value),
      errorCode: "INVALID_EMAIL_FORMAT",
      message: customMessage,
    };
  },

  minLength: (minLen: number, customMessage?: string): FieldValidator => (value) => ({
    isValid: !value || value.length >= minLen,
    errorCode: "INVALID_FORMAT",
    message: customMessage || `Minimum ${minLen} characters required`,
  }),

  maxLength: (maxLen: number, customMessage?: string): FieldValidator => (value) => ({
    isValid: !value || value.length <= maxLen,
    errorCode: "INVALID_FORMAT",
    message: customMessage || `Maximum ${maxLen} characters allowed`,
  }),

  phoneNumber: (customMessage?: string): FieldValidator => (value) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return {
      isValid: !value || phoneRegex.test(value.replace(/\s/g, "")),
      errorCode: "INVALID_PHONE_FORMAT",
      message: customMessage,
    };
  },

  gstNumber: (customMessage?: string): FieldValidator => (value) => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return {
      isValid: !value || gstRegex.test(value),
      errorCode: "INVALID_GST_FORMAT",
      message: customMessage,
    };
  },

  pinCode: (customMessage?: string): FieldValidator => (value) => {
    const pinRegex = /^[1-9][0-9]{5}$/;
    return {
      isValid: !value || pinRegex.test(value),
      errorCode: "INVALID_PIN_CODE",
      message: customMessage,
    };
  },
};

/**
 * Higher-order component for error boundary
 */
export function withErrorHandling<T extends object>(
  Component: React.ComponentType<T>,
  fallbackComponent?: React.ComponentType<{ error: Error }>
): React.ComponentType<T> {
  return function WrappedComponent(props: T) {
    const { handleError } = useErrorHandler();

    try {
      return React.createElement(Component, props);
    } catch (error) {
      handleError("INTERNAL_SERVER_ERROR", error);
      
      if (fallbackComponent) {
        return React.createElement(fallbackComponent, { error: error as Error });
      }
      
      return React.createElement("div", {}, "Something went wrong. Please try again.");
    }
  };
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