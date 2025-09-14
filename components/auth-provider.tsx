"use client";

import { useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/lib/store";
import { authService, getSession } from "@/lib/auth";
import { NotificationService } from "@/lib/notification-service";

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const { 
		setLoading, 
		login, 
		logout, 
		user
	} = useAuthStore();
	
	const initialized = useRef(false);
	const loginNotificationSent = useRef(false);

	// Initialize authentication state - streamlined version
	const initializeAuth = useCallback(async () => {
		if (initialized.current) return;
		
		initialized.current = true;
		setLoading(true);
		
		try {
			console.log('🔍 AuthProvider: Starting session check...');
			
			// Get complete session with role from centralized service
			const session = await getSession();
			
			console.log('🔍 AuthProvider session result:', { 
				hasUser: !!session?.user,
				userEmail: session?.user?.email,
				userRole: session?.user?.role,
				isAuthenticated: session?.isAuthenticated
			});
			
			if (session?.isAuthenticated && session.user) {
				console.log('✅ AuthProvider: Logging in user:', session.user.email);
				login(session.user);
				
				// Create login notification (only once per session)
				if (!loginNotificationSent.current) {
					try {
						await NotificationService.notifyLogin(session.user.id, {
							ipAddress: "Unknown",
							userAgent: navigator.userAgent,
							location: "Unknown",
							isNewDevice: false,
						});
						loginNotificationSent.current = true;
					} catch (error) {
						console.error("Failed to create login notification:", error);
					}
				}
			} else {
				console.log('❌ AuthProvider: No valid session found, logging out');
				logout();
			}
		} catch (error) {
			console.error("❌ Auth initialization error:", error);
			logout();
		} finally {
			setLoading(false);
		}
	}, [setLoading, login, logout]);

	// Initialize auth on mount
	useEffect(() => {
		initializeAuth();
	}, [initializeAuth]);

	// Reset initialization flag when user logs out
	useEffect(() => {
		if (!user) {
			initialized.current = false;
			loginNotificationSent.current = false;
		}
	}, [user]);

	// Listen for auth state changes (e.g., login/logout from other tabs)
	useEffect(() => {
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === 'auth-storage') {
				// Auth state changed in another tab, re-initialize
				console.log('🔄 Auth state changed in another tab, re-checking...');
				initialized.current = false;
				initializeAuth();
			}
		};

		window.addEventListener('storage', handleStorageChange);
		return () => window.removeEventListener('storage', handleStorageChange);
	}, [initializeAuth]);

	return <>{children}</>;
}

