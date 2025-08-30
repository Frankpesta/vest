import { useAuthStore } from "./store";

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
