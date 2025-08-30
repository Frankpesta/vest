import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Shield, FileText, Scale } from "lucide-react";

export default function LegalPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
			<div className="max-w-6xl mx-auto px-4 py-16">
				<div className="text-center mb-12">
					<h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
						Legal Information
					</h1>
					<p className="text-xl text-slate-600 dark:text-slate-300">
						Important legal disclosures and regulatory information
					</p>
				</div>

				<div className="grid md:grid-cols-2 gap-8 mb-12">
					<Card className="bg-white dark:bg-slate-800">
						<CardHeader>
							<CardTitle className="flex items-center text-slate-900 dark:text-white">
								<AlertTriangle className="mr-3 h-6 w-6 text-amber-500" />
								Risk Warnings
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4 text-slate-600 dark:text-slate-300">
								<p>
									<strong>High Risk Investment:</strong> Cryptocurrency and
									alternative investments carry significant risk of loss. You
									may lose some or all of your invested capital.
								</p>
								<p>
									<strong>Volatility:</strong> Digital assets are highly
									volatile and their value can fluctuate dramatically in short
									periods.
								</p>
								<p>
									<strong>Regulatory Risk:</strong> Cryptocurrency regulations
									are evolving and may impact the availability of services.
								</p>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-white dark:bg-slate-800">
						<CardHeader>
							<CardTitle className="flex items-center text-slate-900 dark:text-white">
								<Shield className="mr-3 h-6 w-6 text-green-500" />
								Regulatory Compliance
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4 text-slate-600 dark:text-slate-300">
								<p>
									MultiXcapital operates in compliance with applicable financial
									regulations and maintains appropriate licenses where required.
								</p>
								<p>
									We implement robust KYC (Know Your Customer) and AML
									(Anti-Money Laundering) procedures to ensure regulatory
									compliance.
								</p>
								<p>
									Our services may not be available in all jurisdictions. Please
									check local regulations before using our platform.
								</p>
							</div>
						</CardContent>
					</Card>
				</div>

				<Card className="bg-white dark:bg-slate-800 mb-8">
					<CardHeader>
						<CardTitle className="flex items-center text-slate-900 dark:text-white">
							<FileText className="mr-3 h-6 w-6 text-blue-500" />
							Important Disclaimers
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="prose prose-lg dark:prose-invert max-w-none">
							<h3>Investment Advice Disclaimer</h3>
							<p>
								The information provided on this platform is for educational and
								informational purposes only and should not be construed as
								investment advice. We do not provide personalized investment
								recommendations. Always consult with qualified financial
								advisors before making investment decisions.
							</p>

							<h3>No Guarantee of Returns</h3>
							<p>
								Past performance is not indicative of future results. We make no
								guarantees or promises regarding investment returns. All
								investments carry the risk of loss, including the potential loss
								of principal.
							</p>

							<h3>Technology Risks</h3>
							<p>
								Our platform relies on blockchain technology and smart
								contracts, which may contain bugs or vulnerabilities. While we
								implement security best practices, we cannot guarantee the
								complete security of digital assets or transactions.
							</p>

							<h3>Third-Party Services</h3>
							<p>
								We may integrate with third-party services and protocols. We are
								not responsible for the performance, security, or availability
								of these external services.
							</p>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-white dark:bg-slate-800">
					<CardHeader>
						<CardTitle className="flex items-center text-slate-900 dark:text-white">
							<Scale className="mr-3 h-6 w-6 text-purple-500" />
							Legal Documents
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid md:grid-cols-3 gap-6">
							<div className="text-center">
								<div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
									<FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
								</div>
								<h3 className="font-semibold text-slate-900 dark:text-white mb-2">
									Terms of Service
								</h3>
								<p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
									Complete terms and conditions governing the use of our
									platform
								</p>
								<a
									href="/terms"
									className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
									Read Terms →
								</a>
							</div>

							<div className="text-center">
								<div className="bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
									<Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
								</div>
								<h3 className="font-semibold text-slate-900 dark:text-white mb-2">
									Privacy Policy
								</h3>
								<p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
									How we collect, use, and protect your personal information
								</p>
								<a
									href="/privacy"
									className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
									Read Policy →
								</a>
							</div>

							<div className="text-center">
								<div className="bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
									<AlertTriangle className="h-8 w-8 text-purple-600 dark:text-purple-400" />
								</div>
								<h3 className="font-semibold text-slate-900 dark:text-white mb-2">
									Risk Disclosure
								</h3>
								<p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
									Detailed information about investment risks and disclaimers
								</p>
								<a
									href="#risk-disclosure"
									className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
									View Risks →
								</a>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
