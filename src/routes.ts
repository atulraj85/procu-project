// Routes which are accessible to all.
export const publicRoutes: string[] = ["/", "/verify-email"];

// Routes which are used for authentication.
export const authRoutes: string[] = [
  "/login",
  "/register",
  "/register/company",
  "/error",
  "/forgot-password",
  "/reset-password",
];

// Prefix for API authentication routes.
export const apiAuthPrefix: string = "/api/auth";

export const DEFAULT_LOGIN_REDIRECT: string = "/dashboard";
