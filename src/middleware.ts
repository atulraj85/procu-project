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

  console.log("Middleware: ", { auth: auth, nextUrl: nextUrl });

  if (isApiAuthRoute) {
    console.log("Middleware: isApiAuthRoute: ", isApiAuthRoute);
    return undefined;
  }

  if (isAuthRoute) {
    console.log("Middleware: isAuthRoute: ", isAuthRoute);
    if (isLoggedIn) {
      console.log("Middleware: is: isLoggedIn", isLoggedIn);
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return undefined;
  }

  console.log(
    `Middleware: isLoggedIn: ${isLoggedIn} isPublicRoute: ${isPublicRoute}`
  );
  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/auth/login", nextUrl));
  }

  if (isLoggedIn) {
    console.log(`Middleware: isLoggedIn: ${isLoggedIn}`);
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET!,
      secureCookie: true,
    });
    console.log(`Middleware: token: ${token}`);
    if (!token || !token.role) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    for (const pattern in protectedRoutes) {
      console.log(
        `Middleware: pattern: ${pattern} and path: ${nextUrl.pathname}`
      );
      const regex = new RegExp(pattern);
      if (regex.test(nextUrl.pathname)) {
        const roles = protectedRoutes[pattern];
        console.log(
          `Middleware: pattern: ${pattern} and path: ${nextUrl.pathname} and roles: ${roles}`
        );
        if (!roles.includes(token.role)) {
          return NextResponse.redirect(new URL("/auth/login", req.url));
        }
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
