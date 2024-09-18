import authConfig from "@/auth.config";
import {
  apiAuthPrefix,
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
  protectedRoutes,
  publicRoutes,
} from "@/routes";
import NextAuth from "next-auth";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { auth, nextUrl } = req;
  const isLoggedIn = !!auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    return undefined;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return undefined;
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/auth/login", nextUrl));
  }

  if (isLoggedIn) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET! });
    if (!token || !token.role) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const roles = protectedRoutes[nextUrl.pathname];
    if (roles) {
      if (!roles.includes(token.role)) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }
    }
  }

  return undefined;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
