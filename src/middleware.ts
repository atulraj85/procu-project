// /* eslint-disable @typescript-eslint/no-explicit-any */

// /* eslint-disable @typescript-eslint/no-unused-vars */
// // middleware.ts - just update the API routes section
// import authConfig from "@/auth.config";
// import {
//   apiAuthPrefix,
//   authRoutes,
//   DEFAULT_LOGIN_REDIRECT,
//   protectedRoutes,
//   publicApis,
//   publicRoutes,
// } from "@/routes";
// import NextAuth from "next-auth";
// import { getToken, GetTokenParams } from "next-auth/jwt";
// import { NextResponse } from "next/server";
// import jwt from 'jsonwebtoken';

// const { auth } = NextAuth(authConfig);

// // Helper function to verify JWT token
// async function verifyJWTToken(token: string): Promise<boolean> {
//   try {
//     jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET!);
//     return true;
//   } catch (error) {
//     return false;
//   }
// }

// export default auth(async (req) => {
//   const { auth, nextUrl } = req;

//   const publicApiAuthRoutes = [
//     "/api/auth/login", 
//     "/api/auth/register",
//     "/api/auth/google" // Add this
//   ];
  
//   const isLoggedIn = !!auth;
//   const isApiRoute = nextUrl.pathname.startsWith("/api");
//   const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
//   const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
//   const isPublicApi = publicApis.some((api) =>
//     nextUrl.pathname.startsWith(api)
//   );
//   const isAuthRoute = authRoutes.includes(nextUrl.pathname);

//   const VALID_TOKEN = "Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI5MzI4ZmRjNC03ZThmLTQ1NTgtOTA4MS0xNjE3MDc4YTMyMDYiLCJleHAiOjE3NTYyNzYwNTl9.8T7NYohV7U3QROwubIyptIjDBbB49zVVMwE-0foZ6j0";

//   const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");

//   // Handle API routes
//   if (isApiRoute) {
//     // Allow public API auth routes (login, register, google)
//     if (publicApiAuthRoutes.includes(nextUrl.pathname)) {
//       return undefined;
//     }

//     // Allow other public APIs
//     if (isPublicApi) {
//       return undefined;
//     }

//     // For protected API routes, check for valid token with fallback
//     if (authHeader) {
//       // First check if it matches your hardcoded token
//       if (authHeader === VALID_TOKEN) {
//         return undefined;
//       }
      
//       // If not, try to verify as JWT token (for Google auth users)
//       const isValidJWT = await verifyJWTToken(authHeader);
//       if (isValidJWT) {
//         return undefined;
//       }
//     }

//     // If no valid token found, return unauthorized
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   // Handle web routes (non-API) - keep everything else exactly the same
  
//   // Allow NextAuth API routes
//   if (isApiAuthRoute) {
//     return undefined;
//   }

//   // Handle auth routes (login, register pages)
//   if (isAuthRoute) {
//     if (isLoggedIn) {
//       return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
//     }
//     return undefined;
//   }

//   // Handle public routes
//   if (isPublicRoute) {
//     return undefined;
//   }

//   // For protected web routes, check session-based auth
//   if (!isLoggedIn) {
//     return Response.redirect(new URL("/auth/login", nextUrl));
//   }

//   // Check role-based access for protected routes
//   const params: GetTokenParams = { req, secret: process.env.AUTH_SECRET! };
//   if (process.env.NODE_ENV === "production") {
//     params.secureCookie = true;
//   }

//   const token = await getToken(params);

//   if (!token || !token.role) {
//     return NextResponse.redirect(new URL("/auth/login", req.url));
//   }

//   for (const pattern in protectedRoutes) {
//     const regex = new RegExp(pattern);
//     if (regex.test(nextUrl.pathname)) {
//       const roles = protectedRoutes[pattern];
//       if (!roles.includes(token.role)) {
//         return NextResponse.redirect(new URL("/auth/login", req.url));
//       }
//     }
//   }

//   return undefined;
// });

// export const config = {
//   matcher: [
//     "/((?!_next|[^?]\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).)",
//     "/(api|trpc)(.*)",
//   ],
// };

import authConfig from "@/auth.config";
import {
  apiAuthPrefix,
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
  protectedRoutes,
  publicApis,
  publicRoutes,
  matchesPatterns,
} from "@/routes";
import NextAuth from "next-auth";
import { getToken, GetTokenParams } from "next-auth/jwt";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { auth, nextUrl } = req;
  const isLoggedIn = !!auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = matchesPatterns(nextUrl.pathname, publicRoutes);
  const isPublicApi = matchesPatterns(nextUrl.pathname, publicApis);
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

  if (!isLoggedIn && !isPublicRoute && !isPublicApi) {
    return Response.redirect(new URL("/auth/login", nextUrl));
  }

  if (isLoggedIn) {
    const params: GetTokenParams = { req, secret: process.env.AUTH_SECRET! };
    if (process.env.NODE_ENV === "production") {
      params.secureCookie = true;
    }
    const token = await getToken(params);
    if (!token || !token.role) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    for (const pattern in protectedRoutes) {
      const regex = new RegExp(pattern);
      if (regex.test(nextUrl.pathname)) {
        const roles = protectedRoutes[pattern];
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