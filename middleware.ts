import { NextRequest, NextResponse } from "next/server";
import { authClient } from "@/lib/auth-client";

// Define protected routes
const protectedRoutes = ["/dashboard", "/admin"];
const adminRoutes = ["/admin"];

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Check if the route is protected
	const isProtectedRoute = protectedRoutes.some((route) =>
		pathname.startsWith(route)
	);

	if (!isProtectedRoute) {
		return NextResponse.next();
	}

	try {
		// Get the session from better-auth
		const session = await authClient.getSession();

		// If no session, redirect to login
		if (!session?.data?.session) {
			const loginUrl = new URL("/login", request.url);
			loginUrl.searchParams.set("redirect", pathname);
			return NextResponse.redirect(loginUrl);
		}

		const user = session.data.user;

		// Check if user email is verified for protected routes
		if (!user?.emailVerified && pathname !== "/verify-email") {
			return NextResponse.redirect(new URL("/verify-email", request.url));
		}

		return NextResponse.next();
	} catch (error) {
		// If there's an error getting the session, redirect to login
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("redirect", pathname);
		return NextResponse.redirect(loginUrl);
	}
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
