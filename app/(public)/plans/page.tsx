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
import { CheckCircle, ArrowRight, Star } from "lucide-react";
import { useAuthStore } from "@/lib/store";

export default function PlansPage() {
	const { isAuthenticated } = useAuthStore();

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
		const basePlans = {
			crypto: [
				{
					name: "Starter",
					description: "Perfect for crypto beginners",
					price: "0.1 ETH",
					priceUSD: "$170",
					popular: false,
					features: [
						"Access to 3 crypto categories",
						"Basic DeFi staking",
						"Monthly performance reports",
						"Email support",
						"Mobile app access",
					],
					returns: "12-18%",
					riskLevel: "Medium-High",
				},
				{
					name: "Professional",
					description: "Advanced crypto strategies",
					price: "1.0 ETH",
					priceUSD: "$1,700",
					popular: true,
					features: [
						"Access to all crypto categories",
						"Advanced DeFi strategies",
						"Weekly performance reports",
						"Priority support",
						"Yield farming opportunities",
						"Dedicated crypto advisor",
						"Multi-chain support",
						"Early access to new tokens",
					],
					returns: "18-25%",
					riskLevel: "High",
				},
				{
					name: "Enterprise",
					description: "Institutional crypto management",
					price: "10.0 ETH",
					priceUSD: "$17,000",
					popular: false,
					features: [
						"All Professional features",
						"Custom crypto strategies",
						"Real-time monitoring",
						"24/7 dedicated support",
						"Institutional-grade security",
						"Custom reporting",
						"Direct access to fund managers",
						"Exclusive token launches",
					],
					returns: "20-30%",
					riskLevel: "High",
				},
			],
			"real-estate": [
				{
					name: "Starter",
					description: "Entry-level property investment",
					price: "1.0 ETH",
					priceUSD: "$1,700",
					popular: false,
					features: [
						"Access to 2 property types",
						"Basic portfolio analytics",
						"Quarterly reports",
						"Email support",
						"Property management included",
					],
					returns: "8-12%",
					riskLevel: "Low-Medium",
				},
				{
					name: "Professional",
					description: "Diversified real estate portfolio",
					price: "5.0 ETH",
					priceUSD: "$8,500",
					popular: true,
					features: [
						"Access to all property types",
						"Advanced analytics",
						"Monthly reports",
						"Priority support",
						"International properties",
						"Dedicated property manager",
						"Tax optimization",
						"Early access to new projects",
					],
					returns: "12-18%",
					riskLevel: "Medium",
				},
				{
					name: "Enterprise",
					description: "Institutional real estate management",
					price: "25.0 ETH",
					priceUSD: "$42,500",
					popular: false,
					features: [
						"All Professional features",
						"Custom property strategies",
						"Real-time monitoring",
						"24/7 dedicated support",
						"White-glove service",
						"Custom reporting",
						"Direct developer access",
						"Exclusive property deals",
					],
					returns: "15-25%",
					riskLevel: "Medium-High",
				},
			],
			reits: [
				{
					name: "Starter",
					description: "Basic REIT exposure",
					price: "0.5 ETH",
					priceUSD: "$850",
					popular: false,
					features: [
						"Access to 3 REIT sectors",
						"Basic portfolio tracking",
						"Monthly distributions",
						"Email support",
						"Mobile app access",
					],
					returns: "6-10%",
					riskLevel: "Low",
				},
				{
					name: "Professional",
					description: "Diversified REIT portfolio",
					price: "2.5 ETH",
					priceUSD: "$4,250",
					popular: true,
					features: [
						"Access to all REIT sectors",
						"Advanced analytics",
						"Weekly distributions",
						"Priority support",
						"Global REIT exposure",
						"Dedicated advisor",
						"Tax optimization",
						"Early access to new REITs",
					],
					returns: "8-14%",
					riskLevel: "Low-Medium",
				},
				{
					name: "Enterprise",
					description: "Institutional REIT management",
					price: "12.5 ETH",
					priceUSD: "$21,250",
					popular: false,
					features: [
						"All Professional features",
						"Custom REIT strategies",
						"Real-time monitoring",
						"24/7 dedicated support",
						"Institutional access",
						"Custom reporting",
						"Direct fund manager access",
						"Exclusive REIT opportunities",
					],
					returns: "10-18%",
					riskLevel: "Medium",
				},
			],
			retirement: [
				{
					name: "Starter",
					description: "Basic retirement planning",
					price: "0.25 ETH",
					priceUSD: "$425",
					popular: false,
					features: [
						"Basic portfolio allocation",
						"Annual reviews",
						"Email support",
						"Mobile app access",
						"Tax-advantaged growth",
					],
					returns: "7-12%",
					riskLevel: "Medium",
				},
				{
					name: "Professional",
					description: "Comprehensive retirement strategy",
					price: "1.25 ETH",
					priceUSD: "$2,125",
					popular: true,
					features: [
						"Advanced portfolio allocation",
						"Quarterly reviews",
						"Priority support",
						"Professional advisory",
						"Tax optimization",
						"Dedicated advisor",
						"Flexible contributions",
						"Goal-based planning",
					],
					returns: "10-16%",
					riskLevel: "Medium",
				},
				{
					name: "Enterprise",
					description: "Institutional retirement management",
					price: "6.25 ETH",
					priceUSD: "$10,625",
					popular: false,
					features: [
						"All Professional features",
						"Custom retirement strategies",
						"Real-time monitoring",
						"24/7 dedicated support",
						"White-glove service",
						"Custom reporting",
						"Direct advisor access",
						"Exclusive investment opportunities",
					],
					returns: "12-20%",
					riskLevel: "Medium-High",
				},
			],
			children: [
				{
					name: "Starter",
					description: "Basic children's savings",
					price: "0.1 ETH",
					priceUSD: "$170",
					popular: false,
					features: [
						"Education-focused investments",
						"Annual reviews",
						"Email support",
						"Mobile app access",
						"Tax benefits",
					],
					returns: "8-14%",
					riskLevel: "Medium",
				},
				{
					name: "Professional",
					description: "Comprehensive education planning",
					price: "0.5 ETH",
					priceUSD: "$850",
					popular: true,
					features: [
						"Advanced education strategies",
						"Quarterly reviews",
						"Priority support",
						"Professional advisory",
						"Tax optimization",
						"Dedicated advisor",
						"Flexible contributions",
						"Goal-based planning",
					],
					returns: "10-18%",
					riskLevel: "Medium",
				},
				{
					name: "Enterprise",
					description: "Institutional education management",
					price: "2.5 ETH",
					priceUSD: "$4,250",
					popular: false,
					features: [
						"All Professional features",
						"Custom education strategies",
						"Real-time monitoring",
						"24/7 dedicated support",
						"White-glove service",
						"Custom reporting",
						"Direct advisor access",
						"Exclusive opportunities",
					],
					returns: "12-22%",
					riskLevel: "Medium-High",
				},
			],
			forex: [
				{
					name: "Starter",
					description: "Basic forex exposure",
					price: "0.5 ETH",
					priceUSD: "$850",
					popular: false,
					features: [
						"Major currency pairs",
						"Basic trading strategies",
						"Monthly reports",
						"Email support",
						"Mobile app access",
					],
					returns: "10-16%",
					riskLevel: "High",
				},
				{
					name: "Professional",
					description: "Advanced forex strategies",
					price: "2.5 ETH",
					priceUSD: "$4,250",
					popular: true,
					features: [
						"All major currency pairs",
						"Algorithmic trading",
						"Weekly reports",
						"Priority support",
						"Risk management systems",
						"Dedicated trader",
						"24/5 market access",
						"Early access to strategies",
					],
					returns: "15-25%",
					riskLevel: "High",
				},
				{
					name: "Enterprise",
					description: "Institutional forex management",
					price: "12.5 ETH",
					priceUSD: "$21,250",
					popular: false,
					features: [
						"All Professional features",
						"Custom trading strategies",
						"Real-time monitoring",
						"24/7 dedicated support",
						"Institutional execution",
						"Custom reporting",
						"Direct trader access",
						"Exclusive opportunities",
					],
					returns: "18-30%",
					riskLevel: "High",
				},
			],
		};

		return basePlans[serviceId as keyof typeof basePlans] || [];
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
									{getServicePlans(service.id).map((plan, index) => (
										<Card
											key={index}
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
															{plan.returns}
														</div>
														<div className="text-muted-foreground">
															Expected Return
														</div>
													</div>
													<div className="text-center">
														<Badge
															variant={
																plan.riskLevel === "Low"
																	? "secondary"
																	: plan.riskLevel === "Medium"
																	? "default"
																	: "destructive"
															}>
															{plan.riskLevel}
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
													asChild>
													<Link href={isAuthenticated ? "/dashboard" : "/register"}>
														{isAuthenticated ? "Invest Now" : "Get Started"}{" "}
														<ArrowRight className="ml-2 h-4 w-4" />
													</Link>
												</Button>
											</CardContent>
										</Card>
									))}
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
		</div>
	);
}