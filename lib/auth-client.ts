// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import {
  convexClient,
  crossDomainClient,
} from "@convex-dev/better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!, // e.g. https://adjective-animal-123.convex.site
  plugins: [convexClient(), crossDomainClient()],
});
