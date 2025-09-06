import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	const convexSiteUrl = process.env.CONVEX_SITE_URL;
	
	if (!convexSiteUrl) {
		console.log("CONVEX_SITE_URL not configured in API route");
		return new Response(JSON.stringify({ error: "Convex not configured" }), {
			status: 500,
			headers: { "content-type": "application/json" },
		});
	}
	
	console.log("API route calling Convex:", convexSiteUrl);
	
	const res = await fetch(`${convexSiteUrl}/api/auth/get-session`, {
		method: "GET",
		headers: {
			// forward cookies so Convex can read the session
			cookie: request.headers.get("cookie") ?? "",
		},
		// don't cache session
		cache: "no-store",
	});

	console.log("Convex API response status:", res.status);
	
	const body = await res.text();
	return new Response(body, {
		status: res.status,
		headers: {
			"content-type": res.headers.get("content-type") ?? "application/json",
		},
	});
}
