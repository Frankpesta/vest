import Link from "next/link";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export function Footer() {
	const date = new Date().getFullYear();
	return (
		<footer className="bg-muted/50 border-t">
			<div className="container mx-auto px-4 py-12">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					{/* Company Info */}
					<div className="space-y-4">
						<Link href="/" className="flex items-center space-x-2">
							<div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
								<span className="text-primary-foreground font-bold text-lg">
									M
								</span>
							</div>
							<span className="font-bold text-xl">MultiXcapital</span>
						</Link>
						<p className="text-muted-foreground text-sm">
							Modern investment platform enabling crypto-funded investments
							across traditional and digital assets.
						</p>
						<div className="flex space-x-4">
							<Link
								href="#"
								className="text-muted-foreground hover:text-primary">
								<Facebook className="h-5 w-5" />
							</Link>
							<Link
								href="#"
								className="text-muted-foreground hover:text-primary">
								<Twitter className="h-5 w-5" />
							</Link>
							<Link
								href="#"
								className="text-muted-foreground hover:text-primary">
								<Linkedin className="h-5 w-5" />
							</Link>
							<Link
								href="#"
								className="text-muted-foreground hover:text-primary">
								<Instagram className="h-5 w-5" />
							</Link>
						</div>
					</div>

					{/* Quick Links */}
					<div className="space-y-4">
						<h3 className="font-semibold">Quick Links</h3>
						<div className="space-y-2 text-sm">
							<Link
								href="/about"
								className="block text-muted-foreground hover:text-primary">
								About Us
							</Link>
							<Link
								href="/services"
								className="block text-muted-foreground hover:text-primary">
								Services
							</Link>
							<Link
								href="/plans"
								className="block text-muted-foreground hover:text-primary">
								Investment Plans
							</Link>
							<Link
								href="/blog"
								className="block text-muted-foreground hover:text-primary">
								Blog
							</Link>
						</div>
					</div>

					{/* Legal */}
					<div className="space-y-4">
						<h3 className="font-semibold">Legal</h3>
						<div className="space-y-2 text-sm">
							<Link
								href="/terms"
								className="block text-muted-foreground hover:text-primary">
								Terms & Conditions
							</Link>
							<Link
								href="/privacy"
								className="block text-muted-foreground hover:text-primary">
								Privacy Policy
							</Link>
							<Link
								href="/legal"
								className="block text-muted-foreground hover:text-primary">
								Legal Information
							</Link>
							<Link
								href="/contact"
								className="block text-muted-foreground hover:text-primary">
								Contact
							</Link>
						</div>
					</div>

					{/* Contact */}
					<div className="space-y-4">
						<h3 className="font-semibold">Contact</h3>
						<div className="space-y-2 text-sm text-muted-foreground">
							<p>support@multixcapital.com</p>
							<p>+1 (555) 123-4567</p>
							<p>
								123 Investment St
								<br />
								Financial District
								<br />
								New York, NY 10004
							</p>
						</div>
					</div>
				</div>

				<div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
					<p>&copy; {date} MultiXcapital. All rights reserved.</p>
					<p className="mt-2">
						<strong>Investment Disclaimer:</strong> All investments carry risk.
						Past performance does not guarantee future results.
					</p>
				</div>
			</div>
		</footer>
	);
}
