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
import { Checkbox } from "@/components/ui/checkbox";
import { register, signInWithGoogle } from "@/lib/auth";
import { toast } from "sonner";

export default function RegisterPage() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [acceptTerms, setAcceptTerms] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			setIsLoading(false);
			return;
		}

		if (!acceptTerms) {
			setError("Please accept the terms and conditions");
			setIsLoading(false);
			return;
		}

		try {
			const result = await register({ name, email, password });
			if (result.success) {
				toast("Account Created! Please check your email for verification code");
				router.push("/login");
			}
		} catch (err) {
			setError(`Failed to create account. Please try again.`);
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleSignIn = async () => {
		setIsGoogleLoading(true);
		setError("");

		try {
			await signInWithGoogle();
		} catch (err) {
			setError(`Failed to sign in with Google`);
		} finally {
			setIsGoogleLoading(false);
		}
	};

	return (
		<div className="max-w-3xl w-full mx-auto">
			<Card>
				<CardHeader className="space-y-1">
					<div className="flex items-center justify-center mb-4">
						<div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
							<span className="text-primary-foreground font-bold text-2xl">
								M
							</span>
						</div>
					</div>
					<CardTitle className="text-2xl text-center">Create account</CardTitle>
					<CardDescription className="text-center">
						Start your investment journey with MultiXcapital
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
							<Label htmlFor="name">Full Name</Label>
							<Input
								id="name"
								type="text"
								placeholder="Enter your full name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
							/>
						</div>

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
								placeholder="Create a password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="confirmPassword">Confirm Password</Label>
							<Input
								id="confirmPassword"
								type="password"
								placeholder="Confirm your password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
							/>
						</div>

						<div className="flex items-start space-x-1">
							<Checkbox
								id="terms"
								checked={acceptTerms}
								onCheckedChange={(checked) =>
									setAcceptTerms(checked as boolean)
								}
							/>
							<Label htmlFor="terms" className="text-sm whitespace-nowrap">
								I agree to the
								<Link href="/terms" className="text-primary hover:underline">
									Terms & Conditions
								</Link>
								and
								<Link href="/privacy" className="text-primary hover:underline">
									Privacy Policy
								</Link>
							</Label>
						</div>

						<Button
							type="submit"
							className="w-full"
							disabled={isLoading || isGoogleLoading}>
							{isLoading ? (
								<>
									<LoadingSpinner size="sm" className="mr-2" />
									Creating account...
								</>
							) : (
								"Create account"
							)}
						</Button>
					</form>

					<div className="relative my-6">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">
								Or continue with
							</span>
						</div>
					</div>

					<Button
						type="button"
						variant="outline"
						className="w-full"
						onClick={handleGoogleSignIn}
						disabled={isLoading || isGoogleLoading}>
						{isGoogleLoading ? (
							<>
								<LoadingSpinner size="sm" className="mr-2" />
								Signing up with Google...
							</>
						) : (
							<>
								<svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
									<path
										fill="currentColor"
										d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
									/>
									<path
										fill="currentColor"
										d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									/>
									<path
										fill="currentColor"
										d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
									/>
									<path
										fill="currentColor"
										d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									/>
								</svg>
								Continue with Google
							</>
						)}
					</Button>

					<div className="mt-6 text-center text-sm">
						Already have an account?{" "}
						<Link href="/login" className="text-primary hover:underline">
							Sign in
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
