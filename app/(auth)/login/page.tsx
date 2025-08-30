"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { login } from "@/lib/auth";
import { toast } from "sonner";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			const result = await login({ email, password });
			if (result.success) {
				toast("Successfully logged in!");
				router.push(result.user.role === "admin" ? "/admin" : "/dashboard");
			}
		} catch (err) {
			setError("Invalid email or password");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader className="space-y-1">
				<div className="flex items-center justify-center mb-4">
					<div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
						<span className="text-primary-foreground font-bold text-2xl">
							M
						</span>
					</div>
				</div>
				<CardTitle className="text-2xl text-center">Welcome back</CardTitle>
				<CardDescription className="text-center">
					Enter your credentials to access your account
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					{error && (
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="Enter your email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							placeholder="Enter your password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>

					<Button type="submit" className="w-full" disabled={isLoading}>
						{isLoading ? (
							<>
								<LoadingSpinner size="sm" className="mr-2" />
								Signing in...
							</>
						) : (
							"Sign in"
						)}
					</Button>
				</form>

				<div className="mt-6 text-center text-sm">
					<Link
						href="/forgot-password"
						className="text-primary hover:underline">
						Forgot your password?
					</Link>
				</div>

				<div className="mt-4 text-center text-sm">
					Don't have an account?{" "}
					<Link href="/register" className="text-primary hover:underline">
						Sign up
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}
