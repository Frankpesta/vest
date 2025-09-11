"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { getSession } from "@/lib/auth";
import { NotificationService } from "@/lib/notification-service";

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const { setLoading, login, logout, user } = useAuthStore();

	useEffect(() => {
		const initializeAuth = async () => {
			setLoading(true);
			try {
				const session = await getSession();
				
				if (session?.data?.session && session.data.user) {
					// Map better-auth user to our store format
					const user = {
						id: session.data.user.id,
						email: session.data.user.email,
						name:
							session.data.user.name || session.data.user.email.split("@")[0],
						// better-auth user object doesn't include role; default to user
						role: "user" as const,
						avatar: session.data.user.image || undefined,
						isVerified: session.data.user.emailVerified || false,
						createdAt: new Date().toISOString(),
					};
					login(user);
					
					// Create login notification
					try {
						await NotificationService.notifyLogin(user.id, {
							ipAddress: "Unknown", // You can get this from request headers
							userAgent: navigator.userAgent,
							location: "Unknown", // You can get this from IP geolocation
							isNewDevice: false, // You can implement device tracking
						});
					} catch (error) {
						console.error("Failed to create login notification:", error);
					}
				} else {
					logout();
				}
			} catch (error) {
				console.error("Auth initialization error:", error);
				logout();
			} finally {
				setLoading(false);
			}
		};

		// Add a small delay to ensure cookies are set
		const timeoutId = setTimeout(initializeAuth, 100);
		return () => clearTimeout(timeoutId);
	}, [setLoading, login, logout]);

	return <>{children}</>;
}
