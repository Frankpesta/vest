import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { betterAuth } from "better-auth";
import { convexAdapter } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { betterAuthComponent } from "@/convex/auth";

// Create a server-side Convex client for auth validation
const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Create a server-side auth instance for session validation
const siteUrl = process.env.SITE_URL || "http://localhost:3000";
const auth = betterAuth({
  database: convexAdapter({} as any, betterAuthComponent),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: `${siteUrl}/api/auth/callback/google`,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
  },
  trustedOrigins: [siteUrl],
  plugins: [convex(), crossDomain({ siteUrl })],
});

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie");
    
    if (!cookieHeader) {
      return NextResponse.json({ 
        authenticated: false, 
        user: null, 
        role: "user" 
      });
    }

    // Validate session using Better Auth
    const session = await auth.api.getSession({
      headers: new Headers({ cookie: cookieHeader }),
    });

    if (!session?.user) {
      return NextResponse.json({ 
        authenticated: false, 
        user: null, 
        role: "user" 
      });
    }

    // Get user role from Convex database
    let userRole = "user";
    try {
      // Use the session user ID to get role from database
      const userData = await convexClient.query(api.users.getUserById, { 
        userId: session.user.id 
      });
      userRole = userData?.role || "user";
    } catch (error) {
      console.warn("Failed to fetch user role:", error);
      // Default to user role if database query fails
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || session.user.email?.split("@")[0] || "User",
        role: userRole,
        avatar: session.user.image,
        isVerified: session.user.emailVerified || false,
      },
      role: userRole,
    });
  } catch (error) {
    console.error("Session validation error:", error);
    return NextResponse.json({ 
      authenticated: false, 
      user: null, 
      role: "user" 
    }, { status: 500 });
  }
}
