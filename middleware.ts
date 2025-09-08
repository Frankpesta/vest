// middleware.ts - Performance-optimized approach
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/admin"];
const adminRoutes = ["/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for auth-related pages and static assets
  if (
    pathname.startsWith('/login') || 
    pathname.startsWith('/register') || 
    pathname.startsWith('/verify-email') ||
    pathname.startsWith('/unauthorized')
  ) {
    return NextResponse.next();
  }

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  try {
    // Check for authentication only (no role checking here for performance)
    const allCookies = request.cookies.getAll();
    const sessionToken = allCookies.find(cookie => 
      cookie.name.includes('session') || 
      cookie.name.includes('auth') ||
      cookie.name.includes('better-auth')
    )?.value;

    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // For admin routes, add a header to indicate this needs role verification
    // But don't do the DB query here - let the layout handle it
    if (adminRoutes.some((route) => pathname.startsWith(route))) {
      const response = NextResponse.next();
      response.headers.set('x-requires-admin', 'true');
      return response;
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
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