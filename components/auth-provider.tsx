"use client";

import { useEffect, useCallback } from "react";
import { useAuthStore } from "@/lib/store";
import { getSession } from "@/lib/auth";
import { NotificationService } from "@/lib/notification-service";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const { 
		setLoading, 
		login, 
		logout, 
		user,
		updateUser
	} = useAuthStore();

	// Fetch user role from database when authenticated
	const userRoleData = useQuery(
		api.users.getUserRole, 
		user?.id ? {} : "skip"
	);

	// Initialize authentication state
	const initializeAuth = useCallback(async () => {
		setLoading(true);
		try {
			const session = await getSession();
			
			if (session?.data?.session && session.data.user) {
				// Map better-auth user to our store format
				const userData = {
					id: session.data.user.id,
					email: session.data.user.email,
					name: session.data.user.name || session.data.user.email.split("@")[0],
					role: "user" as const, // Will be updated from database query
					avatar: session.data.user.image || undefined,
					isVerified: session.data.user.emailVerified || false,
					createdAt: new Date().toISOString(),
				};
				login(userData);
				
				// Create login notification (only once per session)
				try {
					await NotificationService.notifyLogin(userData.id, {
						ipAddress: "Unknown",
						userAgent: navigator.userAgent,
						location: "Unknown",
						isNewDevice: false,
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
	}, [setLoading, login, logout]);

	// Update user role when data is available
	useEffect(() => {
		if (user && userRoleData !== undefined) {
			if (userRoleData && userRoleData.role !== user.role) {
				// Update role if it differs from current state
				updateUser({ role: userRoleData.role });
			} else if (!userRoleData) {
				// User not found in database, force logout
				console.warn("User not found in database, logging out");
				logout();
			}
		}
	}, [user, userRoleData, updateUser, logout]);

	// Initialize auth on mount
	useEffect(() => {
		initializeAuth();
	}, [initializeAuth]);

	return <>{children}</>;
}
