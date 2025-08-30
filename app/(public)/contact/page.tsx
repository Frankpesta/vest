"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	MapPin,
	Phone,
	Mail,
	Clock,
	MessageSquare,
	Users,
	HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "",
		message: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		// Mock form submission
		await new Promise((resolve) => setTimeout(resolve, 1000));

		toast(
			"Message sent successfully! We will get back to you as soon as possible."
		);

		setFormData({ name: "", email: "", subject: "", message: "" });
		setIsSubmitting(false);
	};

	const contactInfo = [
		{
			icon: Mail,
			title: "Email Support",
			description: "Get help via email",
			contact: "support@multixcapital.com",
			availability: "24/7 Response",
		},
		{
			icon: Phone,
			title: "Phone Support",
			description: "Speak with our team",
			contact: "+1 (555) 123-4567",
			availability: "Mon-Fri 9AM-6PM EST",
		},
		{
			icon: MessageSquare,
			title: "Live Chat",
			description: "Instant messaging support",
			contact: "Available in dashboard",
			availability: "24/7 for Premium users",
		},
		{
			icon: MapPin,
			title: "Office Location",
			description: "Visit our headquarters",
			contact: "123 Investment St, Financial District",
			availability: "New York, NY 10004",
		},
	];

	const supportTypes = [
		{
			icon: Users,
			title: "General Inquiries",
			description: "Questions about our services, plans, or getting started",
		},
		{
			icon: HelpCircle,
			title: "Technical Support",
			description:
				"Help with platform issues, wallet connections, or transactions",
		},
		{
			icon: Clock,
			title: "Account Management",
			description:
				"Assistance with your investments, withdrawals, or account settings",
		},
	];

	return (
		<div className="min-h-screen">
			{/* Hero Section */}
			<section className="py-20 lg:py-32 bg-gradient-to-br from-primary/5 to-secondary/5">
				<div className="container mx-auto px-4 text-center">
					<Badge variant="secondary" className="mb-6">
						Contact Us
					</Badge>
					<h1 className="text-4xl lg:text-5xl font-bold mb-6">
						Get in Touch with <span className="text-primary">Our Team</span>
					</h1>
					<p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
						Have questions about our investment platform? Need help getting
						started? Our expert team is here to assist you every step of the
						way.
					</p>
				</div>
			</section>

			{/* Contact Methods */}
			<section className="py-20">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-3xl lg:text-4xl font-bold mb-4">
							How Can We Help You?
						</h2>
						<p className="text-xl text-muted-foreground">
							Choose the best way to reach us based on your needs
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
						{contactInfo.map((info, index) => {
							const Icon = info.icon;
							return (
								<Card
									key={index}
									className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
									<CardHeader>
										<div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
											<Icon className="h-8 w-8 text-primary" />
										</div>
										<CardTitle className="text-lg">{info.title}</CardTitle>
										<CardDescription>{info.description}</CardDescription>
									</CardHeader>
									<CardContent className="space-y-2">
										<p className="font-medium">{info.contact}</p>
										<p className="text-sm text-muted-foreground">
											{info.availability}
										</p>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</div>
			</section>

			{/* Support Types */}
			<section className="py-20 bg-muted/30">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-3xl lg:text-4xl font-bold mb-4">
							What Type of Support Do You Need?
						</h2>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						{supportTypes.map((type, index) => {
							const Icon = type.icon;
							return (
								<Card key={index} className="border-0 shadow-lg">
									<CardHeader>
										<div className="flex items-center gap-4">
											<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
												<Icon className="h-6 w-6 text-primary" />
											</div>
											<div>
												<CardTitle className="text-lg">{type.title}</CardTitle>
											</div>
										</div>
									</CardHeader>
									<CardContent>
										<CardDescription>{type.description}</CardDescription>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</div>
			</section>

			{/* Contact Form */}
			<section className="py-20">
				<div className="container mx-auto px-4">
					<div className="grid lg:grid-cols-2 gap-12 items-start">
						<div className="space-y-6">
							<div>
								<h2 className="text-3xl lg:text-4xl font-bold mb-4">
									Send Us a Message
								</h2>
								<p className="text-xl text-muted-foreground">
									Fill out the form and we'll get back to you within 24 hours
								</p>
							</div>

							<Card className="border-0 shadow-xl">
								<CardContent className="p-6">
									<form onSubmit={handleSubmit} className="space-y-6">
										<div className="grid md:grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor="name">Full Name</Label>
												<Input
													id="name"
													value={formData.name}
													onChange={(e) =>
														setFormData({ ...formData, name: e.target.value })
													}
													required
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="email">Email Address</Label>
												<Input
													id="email"
													type="email"
													value={formData.email}
													onChange={(e) =>
														setFormData({ ...formData, email: e.target.value })
													}
													required
												/>
											</div>
										</div>

										<div className="space-y-2">
											<Label htmlFor="subject">Subject</Label>
											<Input
												id="subject"
												value={formData.subject}
												onChange={(e) =>
													setFormData({ ...formData, subject: e.target.value })
												}
												required
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="message">Message</Label>
											<Textarea
												id="message"
												rows={6}
												value={formData.message}
												onChange={(e) =>
													setFormData({ ...formData, message: e.target.value })
												}
												required
											/>
										</div>

										<Button
											type="submit"
											className="w-full"
											size="lg"
											disabled={isSubmitting}>
											{isSubmitting ? "Sending..." : "Send Message"}
										</Button>
									</form>
								</CardContent>
							</Card>
						</div>

						{/* Map and Office Info */}
						<div className="space-y-6">
							<Card className="border-0 shadow-xl">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<MapPin className="h-5 w-5 text-primary" />
										Our Office
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<p className="font-medium">MultiXcapital Headquarters</p>
										<p className="text-muted-foreground">
											123 Investment Street
											<br />
											Financial District
											<br />
											New York, NY 10004
										</p>
									</div>

									<div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
										<p className="text-muted-foreground">
											Interactive Map Coming Soon
										</p>
									</div>
								</CardContent>
							</Card>

							<Card className="border-0 shadow-xl">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Clock className="h-5 w-5 text-primary" />
										Business Hours
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2">
									<div className="flex justify-between">
										<span>Monday - Friday</span>
										<span>9:00 AM - 6:00 PM EST</span>
									</div>
									<div className="flex justify-between">
										<span>Saturday</span>
										<span>10:00 AM - 4:00 PM EST</span>
									</div>
									<div className="flex justify-between">
										<span>Sunday</span>
										<span>Closed</span>
									</div>
									<div className="pt-2 border-t">
										<p className="text-sm text-muted-foreground">
											Email support available 24/7
										</p>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
