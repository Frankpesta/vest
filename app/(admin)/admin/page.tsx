"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { getSession } from "@/lib/auth";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AdminPage() {
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
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold">Admin Dashboard</h1>
				<p className="text-muted-foreground">Manage your platform and users</p>
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle>User Management</CardTitle>
						<CardDescription>
							Manage user accounts and permissions
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button className="w-full">Manage Users</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>System Analytics</CardTitle>
						<CardDescription>
							View platform usage and performance metrics
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button className="w-full">View Analytics</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Content Management</CardTitle>
						<CardDescription>
							Manage platform content and settings
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button className="w-full">Manage Content</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
