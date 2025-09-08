"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function RoleBasedNavigation() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const hasRedirected = useRef(false);
  
  // Get user role from Convex
  const userRole = useQuery(api.users.getUserRole, {});

  useEffect(() => {
    // Reset redirect flag when user changes
    if (user?.id) {
      hasRedirected.current = false;
    }
  }, [user?.id]);

  useEffect(() => {
    if (isAuthenticated && user && userRole !== undefined && !hasRedirected.current) {
      const currentPath = window.location.pathname;
      
      // Only redirect from auth pages (login/register) or when there's a role mismatch
      const shouldRedirect = 
        currentPath === "/login" || 
        currentPath === "/register" ||
        (userRole?.role === "admin" && !currentPath.startsWith("/admin")) ||
        (userRole?.role === "user" && currentPath.startsWith("/admin"));

      if (shouldRedirect) {
        hasRedirected.current = true;
        const redirectUrl = userRole?.role === "admin" ? "/admin" : "/dashboard";
        
        // Use replace instead of push to avoid back button issues
        router.replace(redirectUrl);
      }
    }
  }, [isAuthenticated, user, userRole, router]);

  return null;
}
