"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function UserProfileUpdater() {
	const { updateUser } = useAuthStore();
	
	// Get the current user profile data
	const userProfile = useQuery(api.users.getCurrentUserProfile, {});

	useEffect(() => {
		if (userProfile) {
			// Update the auth store with the latest profile data
			updateUser({
				role: userProfile.role as "user" | "admin",
				avatar: userProfile.image || undefined,
				name: userProfile.name || userProfile.email?.split("@")[0] || "User",
			});
		}
	}, [userProfile, updateUser]);

	return null;
}
