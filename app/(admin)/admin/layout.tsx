"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { getSession } from "@/lib/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { user, isAuthenticated, isLoading, setLoading } = useAuthStore();
	const router = useRouter();

	useEffect(() => {
		const checkAuth = async () => {
			setLoading(true);
			try {
				const session = await getSession();
				if (!session?.data?.session) {
					router.push("/login");
					return;
				}

				// Check if user is admin (use client store which includes role)
				if (user?.role !== "admin") {
					router.push("/dashboard");
					return;
				}
			} catch (error) {
				router.push("/login");
			} finally {
				setLoading(false);
			}
		};

		checkAuth();
	}, [router, setLoading]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<LoadingSpinner size="lg" />
			</div>
		);
	}

	if (!isAuthenticated || !user || user.role !== "admin") {
		return null;
	}

	return (
		<div className="min-h-screen bg-background">
			<nav className="border-b bg-red-50 dark:bg-red-950">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<h1 className="text-xl font-bold text-red-700 dark:text-red-300">
								MultiXcapital Admin
							</h1>
						</div>
						<div className="flex items-center space-x-4">
							<Button
								variant="outline"
								onClick={() => router.push("/dashboard")}>
								Back to Dashboard
							</Button>
							<span className="text-sm text-muted-foreground">
								Admin: {user.name}
							</span>
							<Button
								variant="outline"
								onClick={() => {
									// Handle logout
									window.location.href = "/api/auth/sign-out";
								}}>
								Logout
							</Button>
						</div>
					</div>
				</div>
			</nav>
			<main>{children}</main>
		</div>
	);
}
