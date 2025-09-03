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
import { verifyEmail } from "@/lib/auth";
import { toast } from "sonner";

export default function VerifyEmailPage() {
	const [token, setToken] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [isSuccess, setIsSuccess] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		// Check if token is in URL params
		const urlToken = searchParams.get("token");
		if (urlToken) {
			setToken(urlToken);
			handleVerify(urlToken);
		}
	}, [searchParams]);

	const handleVerify = async (verifyToken?: string) => {
		const tokenToUse = verifyToken || token;
		if (!tokenToUse) {
			setError("Please enter a verification token");
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			const result = await verifyEmail(tokenToUse);
			if (result.success) {
				setIsSuccess(true);
				toast("Email verified successfully!");
				setTimeout(() => {
					router.push("/dashboard");
				}, 2000);
			}
		} catch (err) {
			setError("Invalid or expired verification token");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await handleVerify();
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
						Email Verified!
					</CardTitle>
					<CardDescription className="text-center">
						Your email has been successfully verified. Redirecting to
						dashboard...
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
					Verify your email
				</CardTitle>
				<CardDescription className="text-center">
					Enter the verification code sent to your email address
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
						<Label htmlFor="token">Verification Code</Label>
						<Input
							id="token"
							type="text"
							placeholder="Enter verification code"
							value={token}
							onChange={(e) => setToken(e.target.value)}
							required
						/>
					</div>

					<Button type="submit" className="w-full" disabled={isLoading}>
						{isLoading ? (
							<>
								<LoadingSpinner size="sm" className="mr-2" />
								Verifying...
							</>
						) : (
							"Verify Email"
						)}
					</Button>
				</form>

				<div className="mt-6 text-center text-sm">
					Didn't receive the email?{" "}
					<Button variant="link" className="p-0 h-auto">
						Resend verification email
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
