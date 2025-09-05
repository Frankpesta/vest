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
	unreadCount: number;
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

interface WalletState {
	isConnected: boolean;
	address: string | null;
	balance: number;
	connect: (address: string) => void;
	connectWallet: () => void;
	disconnect: () => void;
	updateBalance: (balance: number) => void;
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
		(set, get) => ({
			notifications: [],
			unreadCount: 0,
			addNotification: (notification) =>
				set((state) => {
					const newNotification = {
						...notification,
						id: crypto.randomUUID(),
						createdAt: new Date().toISOString(),
					};
					const updatedNotifications = [newNotification, ...state.notifications];
					return {
						notifications: updatedNotifications,
						unreadCount: updatedNotifications.filter(n => !n.read).length,
					};
				}),
			markAsRead: (id) =>
				set((state) => {
					const updatedNotifications = state.notifications.map((n) =>
						n.id === id ? { ...n, read: true } : n
					);
					return {
						notifications: updatedNotifications,
						unreadCount: updatedNotifications.filter(n => !n.read).length,
					};
				}),
			removeNotification: (id) =>
				set((state) => {
					const updatedNotifications = state.notifications.filter((n) => n.id !== id);
					return {
						notifications: updatedNotifications,
						unreadCount: updatedNotifications.filter(n => !n.read).length,
					};
				}),
			clearAll: () => set({ notifications: [], unreadCount: 0 }),
		}),
		{
			name: "notifications-storage",
		}
	)
);

export const useWalletStore = create<WalletState>()(
	persist(
		(set) => ({
			isConnected: false,
			address: null,
			balance: 0,
			connect: (address) => set({ isConnected: true, address }),
			connectWallet: () => set({ isConnected: true, address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8e1", balance: 2.5 }),
			disconnect: () => set({ isConnected: false, address: null, balance: 0 }),
			updateBalance: (balance) => set({ balance }),
		}),
		{
			name: "wallet-storage",
		}
	)
);
