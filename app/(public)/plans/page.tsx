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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { CheckCircle, ArrowRight, Star } from "lucide-react";

export default function PlansPage() {
	const plans = [
		{
			name: "Starter",
			description: "Perfect for beginners starting their investment journey",
			price: "0.1 ETH",
			priceUSD: "$170",
			popular: false,
			features: [
				"Access to 3 investment categories",
				"Basic portfolio analytics",
				"Monthly performance reports",
				"Email support",
				"Mobile app access",
				"Minimum 6-month commitment",
			],
			returns: "8-12%",
			riskLevel: "Low",
		},
		{
			name: "Professional",
			description: "Advanced features for serious investors",
			price: "1.0 ETH",
			priceUSD: "$1,700",
			popular: true,
			features: [
				"Access to all investment categories",
				"Advanced portfolio analytics",
				"Weekly performance reports",
				"Priority support",
				"Mobile & web app access",
				"Dedicated account manager",
				"Tax optimization tools",
				"Early access to new investments",
			],
			returns: "12-18%",
			riskLevel: "Medium",
		},
		{
			name: "Enterprise",
			description: "Institutional-grade investment management",
			price: "10.0 ETH",
			priceUSD: "$17,000",
			popular: false,
			features: [
				"All Professional features",
				"Custom investment strategies",
				"Real-time portfolio monitoring",
				"24/7 dedicated support",
				"Institutional-grade security",
				"Custom reporting",
				"Direct access to fund managers",
				"Exclusive investment opportunities",
				"White-glove onboarding",
			],
			returns: "15-25%",
			riskLevel: "Medium-High",
		},
	];

	const comparisonFeatures = [
		{
			feature: "Investment Categories",
			starter: "3",
			professional: "All",
			enterprise: "All + Exclusive",
		},
		{
			feature: "Portfolio Analytics",
			starter: "Basic",
			professional: "Advanced",
			enterprise: "Real-time",
		},
		{
			feature: "Performance Reports",
			starter: "Monthly",
			professional: "Weekly",
			enterprise: "Daily",
		},
		{
			feature: "Support Level",
			starter: "Email",
			professional: "Priority",
			enterprise: "24/7 Dedicated",
		},
		{
			feature: "Account Manager",
			starter: "❌",
			professional: "✅",
			enterprise: "✅ Senior",
		},
		{
			feature: "Tax Optimization",
			starter: "❌",
			professional: "✅",
			enterprise: "✅ Advanced",
		},
		{
			feature: "Custom Strategies",
			starter: "❌",
			professional: "❌",
			enterprise: "✅",
		},
		{
			feature: "Minimum Investment",
			starter: "0.1 ETH",
			professional: "1.0 ETH",
			enterprise: "10.0 ETH",
		},
	];

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
						Select the perfect investment plan that matches your goals, risk
						tolerance, and investment amount. All plans are funded with
						cryptocurrency for seamless transactions.
					</p>
				</div>
			</section>

			{/* Pricing Cards */}
			<section className="py-20">
				<div className="container mx-auto px-4">
					<div className="grid lg:grid-cols-3 gap-8">
						{plans.map((plan, index) => (
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
										<Link href="/register">
											Get Started <ArrowRight className="ml-2 h-4 w-4" />
										</Link>
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Comparison Table */}
			<section className="py-20 bg-muted/30">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-3xl lg:text-4xl font-bold mb-4">
							Detailed Plan Comparison
						</h2>
						<p className="text-xl text-muted-foreground">
							Compare features across all investment plans
						</p>
					</div>

					<Card className="border-0 shadow-xl">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-1/4">Features</TableHead>
									<TableHead className="text-center">Starter</TableHead>
									<TableHead className="text-center bg-primary/5">
										Professional
									</TableHead>
									<TableHead className="text-center">Enterprise</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{comparisonFeatures.map((row, index) => (
									<TableRow key={index}>
										<TableCell className="font-medium">{row.feature}</TableCell>
										<TableCell className="text-center">{row.starter}</TableCell>
										<TableCell className="text-center bg-primary/5 font-medium">
											{row.professional}
										</TableCell>
										<TableCell className="text-center">
											{row.enterprise}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</Card>
				</div>
			</section>

			{/* FAQ Section */}
			<section className="py-20">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-3xl lg:text-4xl font-bold mb-4">
							Frequently Asked Questions
						</h2>
					</div>

					<div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
						<Card className="border-0 shadow-lg">
							<CardHeader>
								<CardTitle className="text-lg">
									Can I upgrade my plan later?
								</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription>
									Yes, you can upgrade your plan at any time. The difference in
									investment amount will be calculated and you can fund the
									upgrade with additional cryptocurrency.
								</CardDescription>
							</CardContent>
						</Card>

						<Card className="border-0 shadow-lg">
							<CardHeader>
								<CardTitle className="text-lg">
									What cryptocurrencies do you accept?
								</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription>
									We accept major cryptocurrencies including ETH, BTC, USDC,
									USDT, and BNB across multiple chains (Ethereum, BSC, Polygon).
								</CardDescription>
							</CardContent>
						</Card>

						<Card className="border-0 shadow-lg">
							<CardHeader>
								<CardTitle className="text-lg">
									Are there any hidden fees?
								</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription>
									No hidden fees. Our management fee is built into the expected
									returns shown. Transaction fees for crypto transfers are
									separate and depend on network conditions.
								</CardDescription>
							</CardContent>
						</Card>

						<Card className="border-0 shadow-lg">
							<CardHeader>
								<CardTitle className="text-lg">
									How are returns calculated?
								</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription>
									Returns are calculated based on the performance of underlying
									investments and are paid out according to your plan's
									schedule. Past performance doesn't guarantee future results.
								</CardDescription>
							</CardContent>
						</Card>
					</div>
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
