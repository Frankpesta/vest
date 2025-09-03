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

// Real auth functions using better-auth
export const login = async (credentials: LoginCredentials) => {
	try {
		const result = await authClient.signIn.email({
			email: credentials.email,
			password: credentials.password,
		});

		if (result.error) {
			throw new Error(result.error.message);
		}

		return { success: true, user: result.data?.user };
	} catch (error) {
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
			throw new Error(result.error.message);
		}

		return { success: true, user: result.data?.user };
	} catch (error) {
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

export const signInWithGoogle = async () => {
	try {
		await authClient.signIn.social({
			provider: "google",
			callbackURL: "/dashboard",
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
