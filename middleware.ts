// middleware.ts - Enhanced security with better session validation
import { NextRequest, NextResponse } from "next/server";

// Route configuration
const protectedRoutes = ["/dashboard", "/admin"];
const adminRoutes = ["/admin"];
const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];
const publicRoutes = ["/", "/about", "/contact", "/api/auth", "/services", "/terms", "/privacy", "/blog/*","/legal"];

// Better Auth session cookie patterns
const SESSION_COOKIE_PATTERNS = [
  /^better-auth\.session_token$/,
  /^better-auth\.csrf_token$/,
  /^__Secure-.*session.*$/i,
  /^session.*$/i
];

function hasValidSessionCookie(request: NextRequest): boolean {
  const cookies = request.cookies.getAll();
  
  // Look for valid session cookies using specific patterns
  return cookies.some(cookie => 
    SESSION_COOKIE_PATTERNS.some(pattern => pattern.test(cookie.name)) &&
    cookie.value && 
    cookie.value.length > 10 // Basic validation - real tokens are longer
  );
}

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route === "/") return pathname === "/";
    return pathname.startsWith(route);
  });
}

function isAuthRoute(pathname: string): boolean {
  return authRoutes.some(route => pathname.startsWith(route));
}

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.startsWith(route));
}

function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some(route => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets and API routes (except auth)
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.') && !pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const hasSession = hasValidSessionCookie(request);

  // Handle authentication routes
  if (isAuthRoute(pathname)) {
    if (hasSession) {
      // Authenticated user accessing auth pages - redirect to dashboard
      // Let client-side routing handle role-based redirect
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Handle protected routes
  if (isProtectedRoute(pathname)) {
    if (!hasSession) {
      // Not authenticated - redirect to login with return URL
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // For admin routes, add headers for client-side role validation
    // This is a performance optimization - full role check happens client-side
    if (isAdminRoute(pathname)) {
      const response = NextResponse.next();
      response.headers.set('x-requires-admin', 'true');
      response.headers.set('x-original-path', pathname);
      return response;
    }

    return NextResponse.next();
  }

  // Default: allow the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};