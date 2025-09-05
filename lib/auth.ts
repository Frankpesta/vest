import { useAuthStore } from "./store";
import { convexAdapter } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { requireEnv } from "@convex-dev/better-auth/utils";
import { betterAuth } from "better-auth";
import { betterAuthComponent } from "../convex/auth";
import { type GenericCtx } from "../convex/_generated/server";

const siteUrl = requireEnv("SITE_URL");

export const createAuth = (ctx: GenericCtx) =>
	// Configure your Better Auth instance here
	betterAuth({
		// All auth requests will be proxied through your next.js server
		baseURL: siteUrl,
		database: convexAdapter(ctx, betterAuthComponent),

		// Simple non-verified email/password to get started
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false,
		},
		plugins: [
			// The Convex plugin is required
			convex(),
		],
	});

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface RegisterCredentials {
	email: string;
	password: string;
	name: string;
}

// Mock auth functions for development
export const login = async (credentials: LoginCredentials) => {
	await new Promise((resolve) => setTimeout(resolve, 1000));

	// Mock successful login
	const mockUser = {
		id: "1",
		email: credentials.email,
		name: credentials.email.split("@")[0],
		role: credentials.email.includes("admin")
			? ("admin" as const)
			: ("user" as const),
		isVerified: true,
		createdAt: new Date().toISOString(),
	};

	useAuthStore.getState().login(mockUser);
	return { success: true, user: mockUser };
};

export const register = async (credentials: RegisterCredentials) => {
	await new Promise((resolve) => setTimeout(resolve, 1000));

	const mockUser = {
		id: Math.random().toString(),
		email: credentials.email,
		name: credentials.name,
		role: "user" as const,
		isVerified: false,
		createdAt: new Date().toISOString(),
	};

	return { success: true, user: mockUser };
};

export const logout = async () => {
	await new Promise((resolve) => setTimeout(resolve, 500));
	useAuthStore.getState().logout();
	return { success: true };
};

export const resetPassword = async (email: string) => {
	await new Promise((resolve) => setTimeout(resolve, 1000));
	return { success: true, message: "Password reset email sent" };
};

export const verifyEmail = async (token: string) => {
	await new Promise((resolve) => setTimeout(resolve, 1000));
	return { success: true, message: "Email verified successfully" };
};
