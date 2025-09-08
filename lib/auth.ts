
import { authClient } from "./auth-client";

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface RegisterCredentials {
	email: string;
	password: string;
	name: string;
}

// Function to get user role and determine redirect URL
export const getUserRedirectUrl = async (): Promise<string> => {
	try {
		// Get session to ensure user is authenticated
		const session = await authClient.getSession();
		if (!session?.data?.session || !session.data.user) {
			return "/login";
		}

		// We need to fetch the user role from Convex
		// Since this is a client-side function, we'll need to make an API call
		// For now, we'll use a default redirect and let the AuthProvider handle role-based navigation
		return "/dashboard"; // Default redirect, will be overridden by AuthProvider
	} catch (error) {
		console.error("Error getting user redirect URL:", error);
		return "/login";
	}
};

// Real auth functions using better-auth
export const login = async (credentials: LoginCredentials, redirectUrl?: string) => {
	try {
		// Use provided redirect URL or default to dashboard
		const callbackURL = redirectUrl || "/dashboard";
		
		const result = await authClient.signIn.email({
			email: credentials.email,
			password: credentials.password,
			callbackURL,
		});

		if (result.error) {
			throw new Error(result.error.message);
		}

		// Wait a moment for the session to be properly set
		await new Promise(resolve => setTimeout(resolve, 100));

		return { success: true, user: result.data?.user };
	} catch (error) {
		console.log(error);
		throw new Error("Invalid email or password");
	}
};

export const register = async (credentials: RegisterCredentials) => {
	try {
		const result = await authClient.signUp.email({
			email: credentials.email,
			password: credentials.password,
			name: credentials.name,
		});

		if (result.error) {
			console.log(result.error);
			throw new Error(result.error.message);
		}

		return { success: true, user: result.data?.user };
	} catch (error) {
		console.log(error);
		throw new Error("Failed to create account. Please try again.");
	}
};

export const logout = async () => {
	try {
		await authClient.signOut();
		return { success: true };
	} catch (error) {
		throw new Error("Failed to logout");
	}
};

export const resetPassword = async (email: string) => {
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
		throw new Error("Failed to send reset email. Please try again.");
	}
};

export const verifyEmail = async (token: string) => {
	try {
		const result = await authClient.verifyEmail({
			query: { token },
		});

		if (result.error) {
			throw new Error(result.error.message);
		}

		return { success: true, message: "Email verified successfully" };
	} catch (error) {
		throw new Error("Failed to verify email");
	}
};

export const signInWithGoogle = async (redirectUrl?: string) => {
	try {
		await authClient.signIn.social({
			provider: "google",
			callbackURL: redirectUrl || "/dashboard",
		});
	} catch (error) {
		throw new Error("Failed to sign in with Google");
	}
};

export const getSession = async () => {
	try {
		const session = await authClient.getSession();
		return session;
	} catch (error) {
		return null;
	}
};
