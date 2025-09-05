"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store";
import { ModeToggle } from "@/components/mode-toggle";
import { useState } from "react";
import { Menu, X, ChevronDown, Settings, Bell, LogOut } from "lucide-react";
import { logout } from "@/lib/auth";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export function Navbar() {
	const [isOpen, setIsOpen] = useState(false);
	const { user, isAuthenticated } = useAuthStore();
	const router = useRouter();

	const navItems = [
		{ href: "/", label: "Home" },
		{ href: "/about", label: "About" },
		{ href: "/services", label: "Services" },
		{ href: "/plans", label: "Plans" },
		{ href: "/blog", label: "Blog" },
		{ href: "/contact", label: "Contact" },
	];

	const handleLogout = async () => {
		await logout();
		router.push("/");
	}

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
							{isAuthenticated && user ? (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" className="flex items-center gap-2 p-2">
											<div className="h-8 w-8 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center">
												{user.avatar ? (
													/* eslint-disable @next/next/no-img-element */
													<img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
												) : (
													<span className="text-xs font-semibold">
														{user.name?.[0]?.toUpperCase()}
													</span>
												)}
											</div>
											<span className="font-medium">{user.name}</span>
											<ChevronDown className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-56">
										<div className="flex items-center justify-start gap-2 p-2">
											<div className="flex flex-col space-y-1 leading-none">
												<p className="font-medium">{user.name}</p>
												<p className="w-[200px] truncate text-sm text-muted-foreground">
													{user.email}
												</p>
											</div>
										</div>
										<DropdownMenuSeparator />
										<DropdownMenuItem asChild>
											<Link href="/dashboard" className="flex items-center">
												<Settings className="mr-2 h-4 w-4" />
												Dashboard
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link href="/settings" className="flex items-center">
												<Settings className="mr-2 h-4 w-4" />
												Settings
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link href="/notifications" className="flex items-center">
												<Bell className="mr-2 h-4 w-4" />
												Notifications
											</Link>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem asChild>
											<button onClick={handleLogout} className="flex items-center text-red-600">
												<LogOut className="mr-2 h-4 w-4" />
												Logout
											</button>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							) : (
								<>
									<Button variant="ghost" asChild>
										<Link href="/login">Login</Link>
									</Button>
									<Button asChild>
										<Link href="/register">Get Started</Link>
									</Button>
								</>
							)}
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
							{isAuthenticated && user ? (
								<>
									<div className="px-4 py-2 flex items-center gap-3">
										<div className="h-8 w-8 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center">
											{user.avatar ? (
												/* eslint-disable @next/next/no-img-element */
												<img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
											) : (
												<span className="text-xs font-semibold">
													{user.name?.[0]?.toUpperCase()}
												</span>
											)}
										</div>
										<div className="text-sm">
											<div className="font-medium leading-none">{user.name}</div>
											<p className="text-muted-foreground text-xs">{user.email}</p>
										</div>
									</div>
									<Link
										href="/dashboard"
										className="block px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
										onClick={() => setIsOpen(false)}>
										Dashboard
									</Link>
									<Link
										href="/settings"
										className="block px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
										onClick={() => setIsOpen(false)}>
										Settings
									</Link>
									<Link
										href="/notifications"
										className="block px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
										onClick={() => setIsOpen(false)}>
										Notifications
									</Link>
									<button onClick={handleLogout} className="flex items-center text-red-600">
												<LogOut className="mr-2 h-4 w-4" />
												Logout
											</button>
								</>
							) : (
								<>
									<Button variant="ghost" className="w-full justify-start" asChild>
										<Link href="/login">Login</Link>
									</Button>
									<Button className="w-full" asChild>
										<Link href="/register">Get Started</Link>
									</Button>
								</>
							)}
						</div>
					</div>
				)}
			</div>
		</nav>
	);
}
