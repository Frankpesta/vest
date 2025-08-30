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
import { register } from "@/lib/auth";
import { toast } from "sonner";

export default function RegisterPage() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [acceptTerms, setAcceptTerms] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
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
				router.push("/verify-email");
			}
		} catch (err) {
			setError("Failed to create account. Please try again.");
		} finally {
			setIsLoading(false);
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

						<Button type="submit" className="w-full" disabled={isLoading}>
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
