import Image from "next/image";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Award, Globe } from "lucide-react";

export default function AboutPage() {
	const team = [
		{
			name: "Alex Thompson",
			role: "CEO & Founder",
			bio: "Former Goldman Sachs VP with 15+ years in investment banking and blockchain technology.",
			image: "/professional-ceo-headshot-business-suit.png",
		},
		{
			name: "Sarah Kim",
			role: "CTO",
			bio: "Ex-Google engineer specializing in fintech and DeFi protocol development.",
			image: "/professional-female-cto-headshot-technology.png",
		},
		{
			name: "Michael Rodriguez",
			role: "Head of Investments",
			bio: "20+ years managing institutional portfolios at BlackRock and Vanguard.",
			image: "/professional-investment-manager-headshot-finance.png",
		},
		{
			name: "Emily Chen",
			role: "Head of Compliance",
			bio: "Former SEC attorney ensuring regulatory compliance across all investment products.",
			image: "/professional-female-lawyer-headshot-compliance.png",
		},
	];

	const values = [
		{
			icon: Users,
			title: "Client-First Approach",
			description:
				"Every decision we make prioritizes our investors' success and financial well-being.",
		},
		{
			icon: Target,
			title: "Innovation & Excellence",
			description:
				"We continuously innovate to provide cutting-edge investment solutions.",
		},
		{
			icon: Award,
			title: "Transparency",
			description:
				"Complete transparency in fees, performance, and investment strategies.",
		},
		{
			icon: Globe,
			title: "Global Accessibility",
			description:
				"Making sophisticated investment strategies accessible to investors worldwide.",
		},
	];

	return (
		<div className="min-h-screen">
			{/* Hero Section */}
			<section className="py-20 lg:py-32 bg-gradient-to-br from-primary/5 to-secondary/5">
				<div className="container mx-auto px-4">
					<div className="grid lg:grid-cols-2 gap-12 items-center">
						<div className="space-y-6">
							<Badge variant="secondary" className="w-fit">
								About MultiXcapital
							</Badge>
							<h1 className="text-4xl lg:text-5xl font-bold leading-tight">
								Bridging Traditional Finance with{" "}
								<span className="text-primary">Digital Innovation</span>
							</h1>
							<p className="text-xl text-muted-foreground leading-relaxed">
								Founded in 2020, MultiXcapital emerged from a simple vision:
								make sophisticated investment strategies accessible to everyone
								through the power of cryptocurrency and blockchain technology.
							</p>
						</div>
						<div className="relative">
							<Image
								src="/modern-office-building-financial-district-professi.png"
								alt="MultiXcapital Office"
								width={600}
								height={500}
								className="rounded-2xl shadow-xl"
							/>
						</div>
					</div>
				</div>
			</section>

			{/* Mission & Vision */}
			<section className="py-20">
				<div className="container mx-auto px-4">
					<div className="grid md:grid-cols-2 gap-12">
						<Card className="border-0 shadow-lg">
							<CardHeader>
								<CardTitle className="text-2xl flex items-center gap-3">
									<Target className="h-8 w-8 text-primary" />
									Our Mission
								</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription className="text-base leading-relaxed">
									To democratize access to sophisticated investment
									opportunities by leveraging cryptocurrency as the universal
									funding mechanism, enabling anyone to build a diversified
									portfolio across traditional and digital assets with
									transparency, security, and exceptional returns.
								</CardDescription>
							</CardContent>
						</Card>

						<Card className="border-0 shadow-lg">
							<CardHeader>
								<CardTitle className="text-2xl flex items-center gap-3">
									<Globe className="h-8 w-8 text-primary" />
									Our Vision
								</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription className="text-base leading-relaxed">
									To become the world's leading crypto-powered investment
									platform, where traditional finance meets blockchain
									innovation, creating a seamless ecosystem that empowers
									investors to achieve their financial goals across all asset
									classes.
								</CardDescription>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Company Values */}
			<section className="py-20 bg-muted/30">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-3xl lg:text-4xl font-bold mb-4">
							Our Core Values
						</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							The principles that guide everything we do at MultiXcapital
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
						{values.map((value, index) => {
							const Icon = value.icon;
							return (
								<Card key={index} className="text-center border-0 shadow-lg">
									<CardHeader>
										<div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
											<Icon className="h-8 w-8 text-primary" />
										</div>
										<CardTitle className="text-lg">{value.title}</CardTitle>
									</CardHeader>
									<CardContent>
										<CardDescription className="text-sm">
											{value.description}
										</CardDescription>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</div>
			</section>

			{/* Team Section */}
			<section className="py-20">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-3xl lg:text-4xl font-bold mb-4">
							Meet Our Leadership Team
						</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Experienced professionals from top financial institutions and
							technology companies
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
						{team.map((member, index) => (
							<Card key={index} className="text-center border-0 shadow-lg">
								<CardHeader>
									<div className="relative w-32 h-32 mx-auto mb-4">
										<Image
											src={member.image || "/placeholder.svg"}
											alt={member.name}
											fill
											className="rounded-full object-cover"
										/>
									</div>
									<CardTitle className="text-xl">{member.name}</CardTitle>
									<CardDescription className="text-primary font-medium">
										{member.role}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<CardDescription className="text-sm">
										{member.bio}
									</CardDescription>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Company Stats */}
			<section className="py-20 bg-primary text-primary-foreground">
				<div className="container mx-auto px-4">
					<div className="text-center mb-12">
						<h2 className="text-3xl lg:text-4xl font-bold mb-4">
							MultiXcapital by the Numbers
						</h2>
						<p className="text-xl opacity-90">
							Our track record speaks for itself
						</p>
					</div>

					<div className="grid md:grid-cols-4 gap-8 text-center">
						<div>
							<div className="text-4xl lg:text-5xl font-bold mb-2">$50M+</div>
							<div className="text-lg opacity-90">Assets Under Management</div>
						</div>
						<div>
							<div className="text-4xl lg:text-5xl font-bold mb-2">10,000+</div>
							<div className="text-lg opacity-90">Active Investors</div>
						</div>
						<div>
							<div className="text-4xl lg:text-5xl font-bold mb-2">15%</div>
							<div className="text-lg opacity-90">Average Annual Return</div>
						</div>
						<div>
							<div className="text-4xl lg:text-5xl font-bold mb-2">50+</div>
							<div className="text-lg opacity-90">Countries Served</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
