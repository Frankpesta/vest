"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, ArrowRight, Star, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { InvestmentModal } from "@/components/investment/investment-modal";
import { useState } from "react";

export default function PlansPage() {
	const { isAuthenticated } = useAuthStore();
	const [selectedPlan, setSelectedPlan] = useState<any>(null);
	const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
	
	// Fetch plans from backend
	const plans = useQuery(api.investmentPlans.getActivePlans);

	const services = [
		{
			id: "crypto",
			name: "Cryptocurrency",
			description: "Digital asset investment opportunities",
		},
		{
			id: "real-estate",
			name: "Real Estate",
			description: "Property investment portfolios",
		},
		{
			id: "reits",
			name: "REITs",
			description: "Real Estate Investment Trusts",
		},
		{
			id: "retirement",
			name: "Retirement",
			description: "Long-term wealth building",
		},
		{
			id: "children",
			name: "Children's Savings",
			description: "Education-focused investments",
		},
		{
			id: "forex",
			name: "Forex",
			description: "Currency trading strategies",
		},
	];

	const getServicePlans = (serviceId: string) => {
		if (!plans) return [];
		return plans.filter(plan => plan.category === serviceId);
	};

	const handleInvestClick = (plan: any) => {
		if (!isAuthenticated) {
			// Redirect to login/register
			window.location.href = "/register";
			return;
		}
		setSelectedPlan(plan);
		setIsInvestmentModalOpen(true);
	};

	return (
		<div className="min-h-screen">
			{/* Hero Section */}
			<section className="py-20 lg:py-32 bg-gradient-to-br from-primary/5 to-secondary/5">
				<div className="container mx-auto px-4 text-center">
					<Badge variant="secondary" className="mb-6">
						Investment Plans
					</Badge>
					<h1 className="text-4xl lg:text-5xl font-bold mb-6">
						Choose Your <span className="text-primary">Investment Plan</span>
					</h1>
					<p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
						Select the perfect investment plan for each service that matches your goals, risk
						tolerance, and investment amount. All plans are funded with
						cryptocurrency for seamless transactions.
					</p>
				</div>
			</section>

			{/* Service Plans */}
			<section className="py-20">
				<div className="container mx-auto px-4">
					<Tabs defaultValue="crypto" className="w-full">
						<TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-8">
							{services.map((service) => (
								<TabsTrigger key={service.id} value={service.id} className="text-xs">
									{service.name}
								</TabsTrigger>
							))}
						</TabsList>

						{services.map((service) => (
							<TabsContent key={service.id} value={service.id} className="space-y-8">
								<div className="text-center mb-8">
									<h2 className="text-3xl font-bold mb-2">{service.name} Plans</h2>
									<p className="text-muted-foreground">{service.description}</p>
								</div>

								<div className="grid lg:grid-cols-3 gap-8">
									{plans ? (
										getServicePlans(service.id).map((plan) => (
											<Card
												key={plan._id}
												className={`relative border-0 shadow-xl ${
													plan.popular ? "ring-2 ring-primary" : ""
												}`}>
												{plan.popular && (
													<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
														<Badge className="bg-primary text-primary-foreground px-4 py-1">
															<Star className="w-4 h-4 mr-1" />
															Most Popular
														</Badge>
													</div>
												)}

												<CardHeader className="text-center pb-8">
													<CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
													<CardDescription className="mb-4">
														{plan.description}
													</CardDescription>
													<div className="space-y-1">
														<div className="text-4xl font-bold text-primary">
															{plan.price}
														</div>
														<div className="text-sm text-muted-foreground">
															≈ {plan.priceUSD} USD
														</div>
													</div>
													<div className="flex justify-center gap-4 mt-4 text-sm">
														<div className="text-center">
															<div className="font-semibold text-green-600">
																{plan.apy}
															</div>
															<div className="text-muted-foreground">
																Expected Return
															</div>
														</div>
														<div className="text-center">
															<Badge
																variant={
																	plan.riskLevel === "low"
																		? "secondary"
																		: plan.riskLevel === "medium"
																		? "default"
																		: "destructive"
																}>
																{plan.riskLevel.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
															</Badge>
															<div className="text-muted-foreground mt-1">
																Risk Level
															</div>
														</div>
													</div>
												</CardHeader>

												<CardContent className="space-y-6">
													<ul className="space-y-3">
														{plan.features.map((feature, idx) => (
															<li key={idx} className="flex items-center gap-3">
																<CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
																<span className="text-sm">{feature}</span>
															</li>
														))}
													</ul>

													<Button
														className="w-full"
														variant={plan.popular ? "default" : "outline"}
														size="lg"
														onClick={() => handleInvestClick(plan)}>
														{isAuthenticated ? "Invest Now" : "Get Started"}{" "}
														<ArrowRight className="ml-2 h-4 w-4" />
													</Button>
												</CardContent>
											</Card>
										))
									) : (
										<div className="col-span-3 flex items-center justify-center py-12">
											<Loader2 className="h-8 w-8 animate-spin" />
											<span className="ml-2">Loading plans...</span>
										</div>
									)}
								</div>
							</TabsContent>
						))}
					</Tabs>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 bg-primary text-primary-foreground">
				<div className="container mx-auto px-4 text-center">
					<h2 className="text-3xl lg:text-4xl font-bold mb-4">
						Ready to Start Investing?
					</h2>
					<p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
						Choose your plan and start building your diversified investment
						portfolio today
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button size="lg" variant="secondary" asChild>
							<Link href="/register">Create Account</Link>
						</Button>
						<Button
							size="lg"
							variant="outline"
							className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
							asChild>
							<Link href="/contact">Talk to Advisor</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Investment Modal */}
			{selectedPlan && (
				<InvestmentModal
					isOpen={isInvestmentModalOpen}
					onClose={() => {
						setIsInvestmentModalOpen(false);
						setSelectedPlan(null);
					}}
					plan={selectedPlan}
				/>
			)}
		</div>
	);
}