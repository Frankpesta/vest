import Image from "next/image";
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
	ArrowRight,
	TrendingUp,
	Shield,
	Clock,
	DollarSign,
} from "lucide-react";

export default function ServicesPage() {
	const services = [
		{
			id: "crypto",
			title: "Cryptocurrency Investments",
			description:
				"Access the world of digital assets through our comprehensive crypto investment solutions",
			image: "/crypto-staking-blockchain.png",
			features: [
				"DeFi Staking & Yield Farming",
				"Token Launch Participation",
				"Diversified Crypto Portfolios",
				"NFT Investment Opportunities",
				"Multi-Chain Support (ETH, BSC, Polygon)",
			],
			minInvestment: "0.1 ETH",
			expectedReturn: "12-25%",
			riskLevel: "Medium-High",
		},
		{
			id: "real-estate",
			title: "Real Estate Investment",
			description:
				"Invest in premium commercial and residential properties worldwide",
			image: "/commercial-real-estate-buildings.png",
			features: [
				"Commercial Property Portfolios",
				"Residential Development Projects",
				"International Real Estate",
				"Property Management Included",
				"Quarterly Dividend Payments",
			],
			minInvestment: "1.0 ETH",
			expectedReturn: "8-15%",
			riskLevel: "Low-Medium",
		},
		{
			id: "reits",
			title: "REITs Portfolio",
			description:
				"Real Estate Investment Trusts offering liquid real estate exposure",
			image: "/reit-portfolio-buildings.png",
			features: [
				"Global REIT Exposure",
				"Monthly Distributions",
				"High Liquidity",
				"Professional Management",
				"Sector Diversification",
			],
			minInvestment: "0.5 ETH",
			expectedReturn: "6-12%",
			riskLevel: "Low",
		},
		{
			id: "retirement",
			title: "Retirement Planning",
			description:
				"Long-term wealth building strategies for your retirement goals",
			image: "/retirement-planning-future.png",
			features: [
				"Tax-Advantaged Growth",
				"Compound Interest Optimization",
				"Risk-Adjusted Portfolios",
				"Professional Advisory",
				"Flexible Contribution Plans",
			],
			minInvestment: "0.25 ETH",
			expectedReturn: "7-14%",
			riskLevel: "Medium",
		},
		{
			id: "children-savings",
			title: "Children's Savings Plans",
			description:
				"Secure your children's financial future with our education-focused investment plans",
			image: "/children-education-savings-college-fund.png",
			features: [
				"Education-Focused Investments",
				"Long-Term Growth Strategy",
				"Flexible Contribution Options",
				"Tax Benefits",
				"Goal-Based Planning",
			],
			minInvestment: "0.1 ETH",
			expectedReturn: "8-16%",
			riskLevel: "Medium",
		},
		{
			id: "forex",
			title: "Forex Investment",
			description:
				"Professional forex trading strategies with institutional-grade execution",
			image: "/forex-trading-currency-exchange-global-markets.png",
			features: [
				"Major Currency Pairs",
				"Algorithmic Trading Strategies",
				"Risk Management Systems",
				"24/5 Market Access",
				"Professional Execution",
			],
			minInvestment: "0.5 ETH",
			expectedReturn: "10-20%",
			riskLevel: "High",
		},
	];

	const benefits = [
		{
			icon: Shield,
			title: "Institutional Security",
			description: "Bank-level security protocols protecting your investments",
		},
		{
			icon: TrendingUp,
			title: "Proven Performance",
			description:
				"Consistent returns across all asset classes and market conditions",
		},
		{
			icon: Clock,
			title: "24/7 Monitoring",
			description: "Round-the-clock portfolio monitoring and risk management",
		},
		{
			icon: DollarSign,
			title: "Transparent Fees",
			description: "No hidden fees - clear, competitive pricing structure",
		},
	];

	return (
		<div className="min-h-screen">
			{/* Hero Section */}
			<section className="py-20 lg:py-32 bg-gradient-to-br from-primary/5 to-secondary/5">
				<div className="container mx-auto px-4 text-center">
					<Badge variant="secondary" className="mb-6">
						Investment Services
					</Badge>
					<h1 className="text-4xl lg:text-5xl font-bold mb-6">
						Diversified Investment Solutions for{" "}
						<span className="text-primary">Every Goal</span>
					</h1>
					<p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
						From cryptocurrency to real estate, our comprehensive investment
						services help you build a diversified portfolio tailored to your
						financial objectives, all funded seamlessly with cryptocurrency.
					</p>
				</div>
			</section>

			{/* Benefits Section */}
			<section className="py-20">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-3xl lg:text-4xl font-bold mb-4">
							Why Choose Our Investment Services?
						</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Professional-grade investment management with the convenience of
							crypto funding
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
						{benefits.map((benefit, index) => {
							const Icon = benefit.icon;
							return (
								<Card key={index} className="text-center border-0 shadow-lg">
									<CardHeader>
										<div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
											<Icon className="h-8 w-8 text-primary" />
										</div>
										<CardTitle className="text-lg">{benefit.title}</CardTitle>
									</CardHeader>
									<CardContent>
										<CardDescription className="text-sm">
											{benefit.description}
										</CardDescription>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</div>
			</section>

			{/* Services Grid */}
			<section className="py-20 bg-muted/30">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-3xl lg:text-4xl font-bold mb-4">
							Our Investment Services
						</h2>
						<p className="text-xl text-muted-foreground">
							Choose from our range of professionally managed investment
							opportunities
						</p>
					</div>

					<div className="grid lg:grid-cols-2 gap-8">
						{services.map((service, index) => (
							<Card key={index} className="overflow-hidden border-0 shadow-xl">
								<div className="grid md:grid-cols-2">
									<div className="relative aspect-square md:aspect-auto">
										<Image
											src={service.image || "/placeholder.svg"}
											alt={service.title}
											fill
											className="object-cover"
										/>
									</div>
									<div className="p-6 flex flex-col justify-between">
										<div className="space-y-4">
											<div>
												<CardTitle className="text-xl mb-2">
													{service.title}
												</CardTitle>
												<CardDescription className="text-sm">
													{service.description}
												</CardDescription>
											</div>

											<div className="space-y-3">
												<div className="flex justify-between text-sm">
													<span className="text-muted-foreground">
														Min Investment:
													</span>
													<span className="font-medium">
														{service.minInvestment}
													</span>
												</div>
												<div className="flex justify-between text-sm">
													<span className="text-muted-foreground">
														Expected Return:
													</span>
													<span className="font-medium text-green-600">
														{service.expectedReturn}
													</span>
												</div>
												<div className="flex justify-between text-sm">
													<span className="text-muted-foreground">
														Risk Level:
													</span>
													<Badge
														variant={
															service.riskLevel === "Low"
																? "secondary"
																: service.riskLevel === "Medium"
																? "default"
																: "destructive"
														}>
														{service.riskLevel}
													</Badge>
												</div>
											</div>

											<div className="space-y-2">
												<h4 className="font-medium text-sm">Key Features:</h4>
												<ul className="space-y-1">
													{service.features.slice(0, 3).map((feature, idx) => (
														<li
															key={idx}
															className="text-xs text-muted-foreground flex items-center gap-2">
															<div className="w-1 h-1 bg-primary rounded-full" />
															{feature}
														</li>
													))}
												</ul>
											</div>
										</div>

										<Button className="w-full mt-4" asChild>
											<Link href="/plans">
												View Plans <ArrowRight className="ml-2 h-4 w-4" />
											</Link>
										</Button>
									</div>
								</div>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 bg-primary text-primary-foreground">
				<div className="container mx-auto px-4 text-center">
					<h2 className="text-3xl lg:text-4xl font-bold mb-4">
						Ready to Diversify Your Portfolio?
					</h2>
					<p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
						Start building your diversified investment portfolio today with our
						professional-grade services
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button size="lg" variant="secondary" asChild>
							<Link href="/register">Start Investing Now</Link>
						</Button>
						<Button
							size="lg"
							variant="outline"
							className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
							asChild>
							<Link href="/plans">View All Plans</Link>
						</Button>
					</div>
				</div>
			</section>
		</div>
	);
}
