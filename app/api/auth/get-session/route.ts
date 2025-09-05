import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	const convexSiteUrl = process.env.CONVEX_SITE_URL!;
	const res = await fetch(`${convexSiteUrl}/api/auth/get-session`, {
		method: "GET",
		headers: {
			// forward cookies so Convex can read the session
			cookie: request.headers.get("cookie") ?? "",
		},
		// don't cache session
		cache: "no-store",
	});

	const body = await res.text();
	return new Response(body, {
		status: res.status,
		headers: {
			"content-type": res.headers.get("content-type") ?? "application/json",
		},
	});
}
