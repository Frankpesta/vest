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

export default function DashboardPage() {
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
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold">Dashboard</h1>
				<p className="text-muted-foreground">Welcome back, {user.name}!</p>
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle>Portfolio Overview</CardTitle>
						<CardDescription>View your investment portfolio</CardDescription>
					</CardHeader>
					<CardContent>
						<Button className="w-full">View Portfolio</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Recent Transactions</CardTitle>
						<CardDescription>
							Track your recent investment activities
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button className="w-full">View Transactions</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Market Analysis</CardTitle>
						<CardDescription>Stay updated with market trends</CardDescription>
					</CardHeader>
					<CardContent>
						<Button className="w-full">View Analysis</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
