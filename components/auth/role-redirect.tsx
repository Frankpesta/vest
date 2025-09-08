"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function RoleRedirect() {
  const router = useRouter();
  const userRole = useQuery(api.users.getUserRole, {});

  useEffect(() => {
    if (userRole?.role === "admin" && window.location.pathname.startsWith("/dashboard")) {
      router.replace("/admin");
    }
  }, [userRole, router]);

  return null;
}
