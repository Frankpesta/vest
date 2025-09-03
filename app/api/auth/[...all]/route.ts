import { nextJsHandler } from "@convex-dev/better-auth/nextjs";

const convexSiteUrl = process.env.CONVEX_SITE_URL;
const handler = nextJsHandler({ convexSiteUrl });

export async function GET(request: Request) {
	console.log("[AUTH API][GET]", { url: request.url, convexSiteUrl });
	try {
		const res = await handler.GET(request);
		console.log("[AUTH API][GET][RES]", res.status);
		return res;
	} catch (error) {
		console.error("[AUTH API][GET][ERR]", error);
		return new Response("Auth GET error", { status: 500 });
	}
}

export async function POST(request: Request) {
	console.log("[AUTH API][POST]", { url: request.url, convexSiteUrl });
	try {
		const res = await handler.POST(request);
		console.log("[AUTH API][POST][RES]", res.status);
		return res;
	} catch (error) {
		console.error("[AUTH API][POST][ERR]", error);
		return new Response("Auth POST error", { status: 500 });
	}
}
