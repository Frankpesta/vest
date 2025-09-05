"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function ResetPasswordPage() {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [isSuccess, setIsSuccess] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		// Check if token is in URL params
		const token = searchParams.get("token");
		if (!token) {
			router.push("/forgot-password");
		}
	}, [searchParams, router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			setIsLoading(false);
			return;
		}

		if (password.length < 8) {
			setError("Password must be at least 8 characters long");
			setIsLoading(false);
			return;
		}

		try {
			const token = searchParams.get("token");
			if (!token) {
				throw new Error("Invalid reset token");
			}

			const result = await authClient.resetPassword({
				newPassword: password,
				token,
			});

			if (result.error) {
				throw new Error(result.error.message);
			}

			setIsSuccess(true);
			toast("Password reset successfully!");
			setTimeout(() => {
				router.push("/login");
			}, 2000);
		} catch (err) {
			setError("Failed to reset password. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	if (isSuccess) {
		return (
			<Card>
				<CardHeader className="space-y-1">
					<div className="flex items-center justify-center mb-4">
						<div className="h-12 w-12 rounded-lg bg-green-500 flex items-center justify-center">
							<svg
								className="h-6 w-6 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
					</div>
					<CardTitle className="text-2xl text-center text-green-600">
						Password Reset!
					</CardTitle>
					<CardDescription className="text-center">
						Your password has been successfully reset. Redirecting to login...
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

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
				<CardTitle className="text-2xl text-center">
					Reset your password
				</CardTitle>
				<CardDescription className="text-center">
					Enter your new password below
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
						<Label htmlFor="password">New Password</Label>
						<Input
							id="password"
							type="password"
							placeholder="Enter your new password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							minLength={8}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="confirmPassword">Confirm New Password</Label>
						<Input
							id="confirmPassword"
							type="password"
							placeholder="Confirm your new password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
							minLength={8}
						/>
					</div>

					<Button type="submit" className="w-full" disabled={isLoading}>
						{isLoading ? (
							<>
								<LoadingSpinner size="sm" className="mr-2" />
								Resetting password...
							</>
						) : (
							"Reset Password"
						)}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
