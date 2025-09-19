import { Role } from "@/schemas";

export const DEFAULT_LOGIN_REDIRECT: string = "/dashboard";

// Prefix for API authentication routes.
export const apiAuthPrefix: string = "/api/auth";

// Routes which are accessible to all (now supports regex patterns for dynamic routes).
export const publicRoutes: string[] = [
  "/", 
  "/auth/verify-email",
  // Add dynamic route patterns here if needed
  // "^/products/[^/]+$", // Example: /products/123
];

// APIs which are accessible to all (now supports regex patterns for dynamic routes).
export const publicApis: string[] = [
  "/api/gst",
  "/api/company",
  "/api/address/states/IN",
  "^/api/address/cities/IN/[^/]+$", // Matches /api/address/cities/IN/123
  "/api/vendor",
  "^/api/vendor/gst/[^/]+$", // Matches /api/vendor/gst/123
];

// Routes which are used for authentication.
export const authRoutes: string[] = [
  "/auth/error",
  "/auth/login",
  "/auth/register",
  "/auth/register/company",
  "/auth/register/company/admin/register",
  "/auth/forgot-password",
  "/auth/reset-password",
];

// Routes which are protected with different roles
export const protectedRoutes: Record<string, Role[]> = {
  "^/dashboard/admin(/.*)?$": ["ADMIN"],
  "^/dashboard/finance(/.*)?$": ["FINANCE_MANAGER"],
  "^/dashboard/manager(/.*)?$": ["PR_MANAGER"],
};

// Helper function to check if a path matches any pattern in an array
export function matchesPatterns(pathname: string, patterns: string[]): boolean {
  return patterns.some(pattern => {
    // If pattern starts with ^, treat as regex
    if (pattern.startsWith('^')) {
      const regex = new RegExp(pattern);
      return regex.test(pathname);
    }
    // Otherwise, exact match
    return pathname === pattern;
  });
}