import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
	id: string;
	email: string;
	name: string;
	role: "user" | "admin";
	avatar?: string;
	isVerified: boolean;
	createdAt: string;
}

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (user: User) => void;
	logout: () => void;
	updateUser: (updates: Partial<User>) => void;
	setLoading: (loading: boolean) => void;
}

interface ThemeState {
	theme: "light" | "dark" | "system";
	setTheme: (theme: "light" | "dark" | "system") => void;
}

interface NotificationState {
	notifications: Array<{
		id: string;
		title: string;
		message: string;
		type: "info" | "success" | "warning" | "error";
		read: boolean;
		createdAt: string;
	}>;
	addNotification: (
		notification: Omit<
			NotificationState["notifications"][0],
			"id" | "createdAt"
		>
	) => void;
	markAsRead: (id: string) => void;
	removeNotification: (id: string) => void;
	clearAll: () => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			isAuthenticated: false,
			isLoading: false,
			login: (user) => set({ user, isAuthenticated: true, isLoading: false }),
			logout: () =>
				set({ user: null, isAuthenticated: false, isLoading: false }),
			updateUser: (updates) =>
				set((state) => ({
					user: state.user ? { ...state.user, ...updates } : null,
				})),
			setLoading: (loading) => set({ isLoading: loading }),
		}),
		{
			name: "auth-storage",
		}
	)
);

export const useThemeStore = create<ThemeState>()(
	persist(
		(set) => ({
			theme: "light",
			setTheme: (theme) => set({ theme }),
		}),
		{
			name: "theme-storage",
		}
	)
);

export const useNotificationStore = create<NotificationState>()(
	persist(
		(set) => ({
			notifications: [],
			addNotification: (notification) =>
				set((state) => ({
					notifications: [
						{
							...notification,
							id: crypto.randomUUID(),
							createdAt: new Date().toISOString(),
						},
						...state.notifications,
					],
				})),
			markAsRead: (id) =>
				set((state) => ({
					notifications: state.notifications.map((n) =>
						n.id === id ? { ...n, read: true } : n
					),
				})),
			removeNotification: (id) =>
				set((state) => ({
					notifications: state.notifications.filter((n) => n.id !== id),
				})),
			clearAll: () => set({ notifications: [] }),
		}),
		{
			name: "notifications-storage",
		}
	)
);
