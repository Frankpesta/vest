export async function GET() {
	const convexSiteUrl = process.env.CONVEX_SITE_URL;
	const result: Record<string, unknown> = {
		convexSiteUrl,
		runtime: process.env.NODE_ENV,
		okEndpoint: `${convexSiteUrl ?? ""}/api/auth/ok`,
	};

	if (!convexSiteUrl) {
		return new Response(
			JSON.stringify({ ...result, error: "CONVEX_SITE_URL is not set" }),
			{ status: 500, headers: { "content-type": "application/json" } }
		);
	}

	try {
		const res = await fetch(`${convexSiteUrl}/api/auth/ok`, {
			method: "GET",
			headers: { "content-type": "application/json" },
		});
		result.remoteOkStatus = res.status;
		result.remoteOkOk = res.ok;
	} catch (error) {
		result.remoteOkError = String(error);
	}

	return new Response(JSON.stringify(result), {
		status: 200,
		headers: { "content-type": "application/json" },
	});
}
