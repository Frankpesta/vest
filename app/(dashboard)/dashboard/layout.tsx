"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { getSession } from "@/lib/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
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

	if (!isAuthenticated || !user) {
		return null;
	}

	return (
		<div className="min-h-screen bg-background">
			<nav className="border-b">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<h1 className="text-xl font-bold">MultiXcapital</h1>
						</div>
						<div className="flex items-center space-x-4">
							<span className="text-sm text-muted-foreground">
								Welcome, {user.name}
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
