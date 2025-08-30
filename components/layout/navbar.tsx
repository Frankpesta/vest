"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
	const [isOpen, setIsOpen] = useState(false);

	const navItems = [
		{ href: "/", label: "Home" },
		{ href: "/about", label: "About" },
		{ href: "/services", label: "Services" },
		{ href: "/plans", label: "Plans" },
		{ href: "/blog", label: "Blog" },
		{ href: "/contact", label: "Contact" },
	];

	return (
		<nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto px-4">
				<div className="flex h-16 items-center justify-between">
					<Link href="/" className="flex items-center space-x-2">
						<div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
							<span className="text-primary-foreground font-bold text-lg">
								M
							</span>
						</div>
						<span className="font-bold text-xl">MultiXcapital</span>
					</Link>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center space-x-6">
						{navItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className="text-muted-foreground hover:text-foreground transition-colors">
								{item.label}
							</Link>
						))}
					</div>

					<div className="flex items-center space-x-4">
						<ModeToggle />
						<div className="hidden md:flex items-center space-x-2">
							<Button variant="ghost" asChild>
								<Link href="/login">Login</Link>
							</Button>
							<Button asChild>
								<Link href="/register">Get Started</Link>
							</Button>
						</div>

						{/* Mobile menu button */}
						<Button
							variant="ghost"
							size="icon"
							className="md:hidden"
							onClick={() => setIsOpen(!isOpen)}>
							{isOpen ? (
								<X className="h-5 w-5" />
							) : (
								<Menu className="h-5 w-5" />
							)}
						</Button>
					</div>
				</div>

				{/* Mobile Navigation */}
				{isOpen && (
					<div className="md:hidden py-4 space-y-2">
						{navItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className="block px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
								onClick={() => setIsOpen(false)}>
								{item.label}
							</Link>
						))}
						<div className="px-4 pt-2 space-y-2">
							<Button variant="ghost" className="w-full justify-start" asChild>
								<Link href="/login">Login</Link>
							</Button>
							<Button className="w-full" asChild>
								<Link href="/register">Get Started</Link>
							</Button>
						</div>
					</div>
				)}
			</div>
		</nav>
	);
}
