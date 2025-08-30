"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
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
import { resetPassword } from "@/lib/auth";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			const result = await resetPassword(email);
			if (result.success) {
				setIsSuccess(true);
				toast("Check your email for password reset instructions");
			}
		} catch (err) {
			setError("Failed to send reset email. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	if (isSuccess) {
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
						Check your email
					</CardTitle>
					<CardDescription className="text-center">
						We've sent password reset instructions to {email}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-center">
						<Link href="/login">
							<Button variant="outline" className="w-full bg-transparent">
								Back to login
							</Button>
						</Link>
					</div>
				</CardContent>
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
				<CardTitle className="text-2xl text-center">Reset password</CardTitle>
				<CardDescription className="text-center">
					Enter your email address and we'll send you a reset link
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

					<Button type="submit" className="w-full" disabled={isLoading}>
						{isLoading ? (
							<>
								<LoadingSpinner size="sm" className="mr-2" />
								Sending reset email...
							</>
						) : (
							"Send reset email"
						)}
					</Button>
				</form>

				<div className="mt-6 text-center text-sm">
					Remember your password?{" "}
					<Link href="/login" className="text-primary hover:underline">
						Sign in
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}
