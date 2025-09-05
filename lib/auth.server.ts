// src/lib/auth.server.ts
import { betterAuth } from "better-auth";
import { convexAdapter } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { betterAuthComponent } from "@/convex/auth";
import type { GenericCtx } from "@/convex/_generated/server";

const siteUrl = process.env.SITE_URL!; // set in Convex env

export const createAuth = (ctx: GenericCtx) =>
  betterAuth({
    database: convexAdapter(ctx, betterAuthComponent),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		redirectURI: `${siteUrl}/api/auth/callback/google`,
      },
    },
    // Add these important configurations
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 24 hours
    },
    callbacks: {
      async redirect({ url, baseUrl, request }: {
		url: string;
		baseUrl: string;
		request?: Request;
	}) {
        // Handle post-login redirects
        const redirectUrl = new URL(request?.url || baseUrl);
        const searchParams = redirectUrl.searchParams;
        const redirectParam = searchParams.get('redirect');
        
        // If there's a redirect parameter, use it
        if (redirectParam && redirectParam.startsWith('/')) {
          return baseUrl + redirectParam;
        }
        
        // Default redirect after successful auth
        if (url === baseUrl + "/login" || url === baseUrl + "/signup") {
          return baseUrl + "/dashboard";
        }
        
        return url;
      },
    },
    trustedOrigins: [siteUrl],
    plugins: [
      convex(),
      crossDomain({ siteUrl }), // enables cross-domain from your Next app
    ],
  });