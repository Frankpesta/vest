// middleware.ts - Server-side session validation with role-based access
import { NextRequest, NextResponse } from "next/server";

// Route configuration
const protectedRoutes = ["/dashboard", "/admin"];
const adminRoutes = ["/admin"];
const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];
const publicRoutes = ["/", "/about", "/contact", "/api/auth", "/services", "/terms", "/privacy", "/blog/*","/legal"];

// Cache for session validation to reduce API calls
const sessionCache = new Map<string, { 
  authenticated: boolean; 
  user: any; 
  role: string; 
  timestamp: number 
}>();
const CACHE_DURATION = 60000; // 1 minute

async function validateSession(request: NextRequest): Promise<{
  authenticated: boolean;
  user: any;
  role: string;
}> {
  const cookieHeader = request.headers.get("cookie");
  
  if (!cookieHeader) {
    return { authenticated: false, user: null, role: "user" };
  }

  // Check cache first
  const cacheKey = cookieHeader.substring(0, 50); // Use first 50 chars as key
  const cached = sessionCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return {
      authenticated: cached.authenticated,
      user: cached.user,
      role: cached.role
    };
  }

  try {
    // Validate session with our API
    const response = await fetch(`${request.nextUrl.origin}/api/auth/validate-session`, {
      headers: {
        cookie: cookieHeader,
      },
    });

    if (!response.ok) {
      return { authenticated: false, user: null, role: "user" };
    }

    const data = await response.json();
    
    // Cache the result
    sessionCache.set(cacheKey, {
      authenticated: data.authenticated,
      user: data.user,
      role: data.role,
      timestamp: Date.now()
    });

    return {
      authenticated: data.authenticated,
      user: data.user,
      role: data.role
    };
  } catch (error) {
    console.error("Session validation error:", error);
    return { authenticated: false, user: null, role: "user" };
  }
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

  // Skip middleware for static assets and API routes (except auth validation)
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    (pathname.includes('.') && !pathname.startsWith('/api/auth/validate-session'))
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Validate session for protected routes
  const { authenticated, user, role } = await validateSession(request);

  // Handle authentication routes
  if (isAuthRoute(pathname)) {
    if (authenticated && user) {
      // Authenticated user accessing auth pages - redirect based on role
      const redirectUrl = role === "admin" ? "/admin" : "/dashboard";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  // Handle protected routes
  if (isProtectedRoute(pathname)) {
    if (!authenticated || !user) {
      // Not authenticated - redirect to login with return URL
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Handle admin route access control
    if (isAdminRoute(pathname)) {
      if (role !== "admin") {
        // Not admin - redirect to dashboard
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // Add user info to headers for client-side use
    const response = NextResponse.next();
    response.headers.set('x-user-id', user.id);
    response.headers.set('x-user-role', role);
    response.headers.set('x-user-email', user.email);
    
    return response;
  }

  // Default: allow the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};