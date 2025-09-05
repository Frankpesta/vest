// convex/http.ts
import { httpRouter } from "convex/server";
import { betterAuthComponent } from "./auth";
import { createAuth } from "@/lib/auth.server";

const http = httpRouter();
betterAuthComponent.registerRoutes(http, createAuth, { cors: true });
export default http;
