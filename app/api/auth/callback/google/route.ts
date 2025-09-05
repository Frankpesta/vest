// app/api/auth/callback/google/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const redirectParam = searchParams.get("redirect");

	// Default redirect location
	let redirectUrl = "/dashboard";

	if (redirectParam && redirectParam.startsWith("/")) {
		redirectUrl = redirectParam;
	}

	// The OAuth flow should be handled by better-auth
	// This just handles the final redirect
	return NextResponse.redirect(new URL(redirectUrl, request.url));
}
