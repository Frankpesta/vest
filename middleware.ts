// middleware.ts
import { NextRequest, NextResponse } from "next/server";

// Define protected and role-based routes
const protectedRoutes = ["/dashboard", "/admin"];
const adminRoutes = ["/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for auth-related pages to avoid redirect loops
  if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/verify-email')) {
    return NextResponse.next();
  }

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  try {
    // Check for better-auth session cookies
    const allCookies = request.cookies.getAll();
    const sessionToken = allCookies.find(cookie => 
      cookie.name.includes('session') || 
      cookie.name.includes('auth') ||
      cookie.name.includes('better-auth')
    )?.value;

    // If no session token found, redirect to login
    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check for admin routes and verify admin role
    if (adminRoutes.some((route) => pathname.startsWith(route))) {
      // For admin routes, we need to verify the user's role
      // Since we can't easily get user data in middleware without API calls,
      // we'll let the admin page handle role verification
      // The middleware ensures the user is authenticated, the page verifies admin role
    }

    // If we have a session token, allow access
    return NextResponse.next();
  } catch (error) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};