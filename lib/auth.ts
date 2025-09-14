
import { authClient } from "./auth-client";
import { api } from "@/convex/_generated/api";
import { ConvexReactClient } from "convex/react";

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface RegisterCredentials {
	email: string;
	password: string;
	name: string;
}

export interface User {
	id: string;
	email: string;
	name: string;
	role: "user" | "admin";
	avatar?: string;
	isVerified: boolean;
	createdAt: string;
}

export interface AuthSession {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	role?: "user" | "admin";
}

// Centralized auth service - single source of truth
class AuthService {
	private convex: ConvexReactClient | null = null;
	private sessionCache: AuthSession | null = null;
	private cacheExpiry: number = 0;
	private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

	constructor() {
		if (typeof window !== 'undefined') {
			this.convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
		}
	}

	// Get fresh session data with role from database
	async getSessionWithRole(): Promise<AuthSession> {
		// Check cache first
		if (this.sessionCache && Date.now() < this.cacheExpiry) {
			return this.sessionCache;
		}

		try {
			// Get session from Better Auth
			const session = await authClient.getSession();
			
			if (!session?.data?.user) {
				this.sessionCache = {
					user: null,
					isAuthenticated: false,
					isLoading: false
				};
				return this.sessionCache;
			}

			// Get user role from database
			let userRole: "user" | "admin" = "user";
			if (this.convex) {
				try {
					const roleData = await this.convex.query(api.users.getUserRole, {});
					userRole = (roleData?.role as "user" | "admin") || "user";
				} catch (error) {
					console.warn("Failed to fetch user role:", error);
				}
			}

			// Map Better Auth user to our format
			const user: User = {
				id: session.data.user.id,
				email: session.data.user.email,
				name: session.data.user.name || session.data.user.email?.split("@")[0] || "User",
				role: userRole,
				avatar: session.data.user.image || undefined,
				isVerified: session.data.user.emailVerified || false,
				createdAt: new Date().toISOString(),
			};

			this.sessionCache = {
				user,
				isAuthenticated: true,
				isLoading: false,
				role: userRole
			};

			// Set cache expiry
			this.cacheExpiry = Date.now() + this.CACHE_DURATION;

			return this.sessionCache;
		} catch (error) {
			console.error("Auth session error:", error);
			this.sessionCache = {
				user: null,
				isAuthenticated: false,
				isLoading: false
			};
			return this.sessionCache;
		}
	}

	// Clear cache when auth state changes
	clearCache() {
		this.sessionCache = null;
		this.cacheExpiry = 0;
	}

	// Get redirect URL based on role
	getRedirectUrl(userRole: "user" | "admin"): string {
		return userRole === "admin" ? "/admin" : "/dashboard";
	}

	// Check if user has admin access
	hasAdminAccess(userRole?: "user" | "admin"): boolean {
		return userRole === "admin";
	}
}

// Export singleton instance
export const authService = new AuthService();

// Simplified auth functions
export const login = async (credentials: LoginCredentials): Promise<{ success: boolean; user?: User; redirectUrl?: string }> => {
	try {
		const result = await authClient.signIn.email({
			email: credentials.email,
			password: credentials.password,
		});

		if (result.error) {
			throw new Error(result.error.message);
		}

		// Clear cache to force fresh session fetch
		authService.clearCache();
		
		// Get fresh session with role
		const session = await authService.getSessionWithRole();
		
		if (session.isAuthenticated && session.user) {
			return {
				success: true,
				user: session.user,
				redirectUrl: authService.getRedirectUrl(session.user.role)
			};
		}

		throw new Error("Login successful but session not established");
	} catch (error) {
		console.error("Login error:", error);
		throw new Error("Invalid email or password");
	}
};

export const register = async (credentials: RegisterCredentials): Promise<{ success: boolean; user?: User; redirectUrl?: string }> => {
	try {
		const result = await authClient.signUp.email({
			email: credentials.email,
			password: credentials.password,
			name: credentials.name,
		});

		if (result.error) {
			throw new Error(result.error.message);
		}

		// Clear cache to force fresh session fetch
		authService.clearCache();
		
		// Get fresh session with role
		const session = await authService.getSessionWithRole();
		
		if (session.isAuthenticated && session.user) {
			return {
				success: true,
				user: session.user,
				redirectUrl: authService.getRedirectUrl(session.user.role)
			};
		}

		throw new Error("Registration successful but session not established");
	} catch (error) {
		console.error("Registration error:", error);
		throw new Error("Failed to create account. Please try again.");
	}
};

export const logout = async (): Promise<{ success: boolean }> => {
	try {
		await authClient.signOut();
		
		// Clear all auth state
		authService.clearCache();
		
		if (typeof window !== 'undefined') {
			// Clear cookies
			document.cookie.split(";").forEach(cookie => {
				const eqPos = cookie.indexOf("=");
				const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
				if (name.includes('session') || name.includes('auth') || name.includes('__')) {
					document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
				}
			});
			
			// Clear storage
			localStorage.removeItem("auth-storage");
			sessionStorage.clear();
		}
		
		return { success: true };
	} catch (error) {
		console.error("Logout error:", error);
		// Force clear everything even if logout fails
		authService.clearCache();
		if (typeof window !== 'undefined') {
			localStorage.removeItem("auth-storage");
			sessionStorage.clear();
		}
		return { success: true };
	}
};

export const signInWithGoogle = async (): Promise<void> => {
	try {
		await authClient.signIn.social({
			provider: "google",
		});
	} catch (error) {
		console.error("Google sign-in error:", error);
		throw new Error("Failed to sign in with Google");
	}
};

export const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
	try {
		const result = await authClient.forgetPassword({
			email,
			redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
		});

		if (result.error) {
			throw new Error(result.error.message);
		}

		return { success: true, message: "Password reset email sent" };
	} catch (error) {
		console.error("Password reset error:", error);
		throw new Error("Failed to send reset email. Please try again.");
	}
};

export const verifyEmail = async (token: string): Promise<{ success: boolean; message: string }> => {
	try {
		const result = await authClient.verifyEmail({
			query: { token },
		});

		if (result.error) {
			throw new Error(result.error.message);
		}

		// Clear cache to refresh user verification status
		authService.clearCache();

		return { success: true, message: "Email verified successfully" };
	} catch (error) {
		console.error("Email verification error:", error);
		throw new Error("Failed to verify email");
	}
};

// Export key functions
export const getSession = () => authService.getSessionWithRole();
export const getUserRedirectUrl = (userRole: "user" | "admin") => authService.getRedirectUrl(userRole);
