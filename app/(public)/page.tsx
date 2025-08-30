"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield, TrendingUp, Wallet, Star } from "lucide-react";

export default function HomePage() {
	const services = [
		{
			title: "Crypto Investments",
			description:
				"DeFi staking, yield farming, and diversified crypto portfolios",
			icon: "💰",
			image: "/crypto-staking-blockchain.png",
		},
		{
			title: "Real Estate",
			description:
				"Commercial and residential real estate investment opportunities",
			icon: "🏢",
			image: "/commercial-real-estate-buildings.png",
		},
		{
			title: "REITs",
			description: "Real Estate Investment Trusts with global exposure",
			icon: "🏘️",
			image: "/reit-portfolio-buildings.png",
		},
		{
			title: "Retirement Planning",
			description: "Long-term growth focused retirement savings plans",
			icon: "🎯",
			image: "/retirement-planning-future.png",
		},
	];

	const features = [
		{
			icon: Shield,
			title: "Secure & Regulated",
			description: "Bank-level security with full regulatory compliance",
		},
		{
			icon: TrendingUp,
			title: "Proven Returns",
			description:
				"Track record of consistent performance across asset classes",
		},
		{
			icon: Wallet,
			title: "Crypto-Powered",
			description: "Seamless crypto funding with multi-chain support",
		},
	];

	const testimonials = [
		{
			name: "Sarah Johnson",
			role: "Portfolio Manager",
			content:
				"MultiXcapital has transformed how I approach diversified investing. The crypto funding makes everything seamless.",
			rating: 5,
		},
		{
			name: "Michael Chen",
			role: "Tech Entrepreneur",
			content:
				"Finally, an investment platform that understands both traditional and digital assets. Excellent returns so far.",
			rating: 5,
		},
		{
			name: "Emily Rodriguez",
			role: "Financial Advisor",
			content:
				"The transparency and ease of use is outstanding. My clients love the real-time portfolio tracking.",
			rating: 5,
		},
	];

	return (
		<div className="min-h-screen">
			{/* Hero Section */}
			<section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20 lg:py-32">
				<div className="container mx-auto px-4">
					<div className="grid lg:grid-cols-2 gap-12 items-center">
						<div className="space-y-8">
							<div className="space-y-4">
								<Badge variant="secondary" className="w-fit">
									🚀 Now Supporting Multi-Chain Investments
								</Badge>
								<h1 className="text-4xl lg:text-6xl font-bold leading-tight">
									Invest in the Future with{" "}
									<span className="text-primary">Cryptocurrency</span>
								</h1>
								<p className="text-xl text-muted-foreground leading-relaxed">
									Access traditional and digital investment opportunities
									through our crypto-powered platform. From DeFi to real estate,
									build your diversified portfolio today.
								</p>
							</div>

							<div className="flex flex-col sm:flex-row gap-4">
								<Button size="lg" asChild>
									<Link href="/register">
										Start Investing <ArrowRight className="ml-2 h-5 w-5" />
									</Link>
								</Button>
								<Button size="lg" variant="outline" asChild>
									<Link href="/plans">View Investment Plans</Link>
								</Button>
							</div>

							<div className="flex items-center gap-8 pt-4">
								<div className="text-center">
									<div className="text-2xl font-bold text-primary">$50M+</div>
									<div className="text-sm text-muted-foreground">
										Assets Under Management
									</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-primary">15%</div>
									<div className="text-sm text-muted-foreground">
										Average Annual Return
									</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-primary">10K+</div>
									<div className="text-sm text-muted-foreground">
										Active Investors
									</div>
								</div>
							</div>
						</div>

						<div className="relative">
							<Image
								src="/placeholder-gbqmx.png"
								alt="Investment Dashboard"
								width={600}
								height={600}
								className="rounded-2xl shadow-2xl"
							/>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-20 bg-muted/30">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-3xl lg:text-4xl font-bold mb-4">
							Why Choose MultiXcapital?
						</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							We combine the best of traditional finance with cutting-edge
							blockchain technology
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						{features.map((feature, index) => {
							const Icon = feature.icon;
							return (
								<Card key={index} className="text-center border-0 shadow-lg">
									<CardHeader>
										<div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
											<Icon className="h-8 w-8 text-primary" />
										</div>
										<CardTitle className="text-xl">{feature.title}</CardTitle>
									</CardHeader>
									<CardContent>
										<CardDescription className="text-base">
											{feature.description}
										</CardDescription>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</div>
			</section>

			{/* Services Section */}
			<section className="py-20">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-3xl lg:text-4xl font-bold mb-4">
							Investment Opportunities
						</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Diversify your portfolio across multiple asset classes, all funded
							with cryptocurrency
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
						{services.map((service, index) => (
							<Card
								key={index}
								className="group hover:shadow-xl transition-all duration-300 cursor-pointer">
								<div className="aspect-video relative overflow-hidden rounded-t-lg">
									<Image
										src={service.image || "/placeholder.svg"}
										alt={service.title}
										fill
										className="object-cover group-hover:scale-105 transition-transform duration-300"
									/>
								</div>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<span className="text-2xl">{service.icon}</span>
										{service.title}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<CardDescription>{service.description}</CardDescription>
								</CardContent>
							</Card>
						))}
					</div>

					<div className="text-center mt-12">
						<Button size="lg" asChild>
							<Link href="/services">
								Explore All Services <ArrowRight className="ml-2 h-5 w-5" />
							</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Testimonials Section */}
			<section className="py-20 bg-muted/30">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-3xl lg:text-4xl font-bold mb-4">
							What Our Investors Say
						</h2>
						<p className="text-xl text-muted-foreground">
							Join thousands of satisfied investors who trust MultiXcapital
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						{testimonials.map((testimonial, index) => (
							<Card key={index} className="border-0 shadow-lg">
								<CardHeader>
									<div className="flex items-center gap-1 mb-2">
										{[...Array(testimonial.rating)].map((_, i) => (
											<Star
												key={i}
												className="h-5 w-5 fill-yellow-400 text-yellow-400"
											/>
										))}
									</div>
									<CardDescription className="text-base italic">
										"{testimonial.content}"
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex items-center gap-3">
										<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
											<span className="font-semibold text-primary">
												{testimonial.name
													.split(" ")
													.map((n) => n[0])
													.join("")}
											</span>
										</div>
										<div>
											<div className="font-semibold">{testimonial.name}</div>
											<div className="text-sm text-muted-foreground">
												{testimonial.role}
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
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
						Join MultiXcapital today and start building your diversified
						investment portfolio with cryptocurrency
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button size="lg" variant="secondary" asChild>
							<Link href="/register">Create Free Account</Link>
						</Button>
						<Button
							size="lg"
							variant="outline"
							className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
							asChild>
							<Link href="/contact">Talk to an Advisor</Link>
						</Button>
					</div>
				</div>
			</section>
		</div>
	);
}
