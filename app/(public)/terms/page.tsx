import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
			<div className="max-w-4xl mx-auto px-4 py-16">
				<div className="text-center mb-12">
					<h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
						Terms and Conditions
					</h1>
					<p className="text-xl text-slate-600 dark:text-slate-300">
						Last updated: December 15, 2024
					</p>
				</div>

				<Card className="bg-white dark:bg-slate-800">
					<CardContent className="p-8">
						<div className="prose prose-lg dark:prose-invert max-w-none">
							<h2>1. Acceptance of Terms</h2>
							<p>
								By accessing and using MultiXcapital's services, you accept and
								agree to be bound by the terms and provision of this agreement.
								These Terms and Conditions govern your use of our investment
								platform and services.
							</p>

							<h2>2. Investment Services</h2>
							<p>
								MultiXcapital provides access to various investment
								opportunities including but not limited to:
							</p>
							<ul>
								<li>
									Cryptocurrency investments (staking, yield farming, DeFi
									protocols)
								</li>
								<li>Real Estate Investment Trusts (REITs)</li>
								<li>Traditional real estate investments</li>
								<li>Retirement planning services</li>
								<li>Children's savings plans</li>
								<li>Foreign exchange (Forex) investments</li>
							</ul>

							<h2>3. Risk Disclosure</h2>
							<p>
								<strong>Investment Risk:</strong> All investments carry inherent
								risks, including the potential loss of principal. Cryptocurrency
								investments are particularly volatile and may result in
								significant losses.
							</p>
							<p>
								<strong>Market Risk:</strong> The value of investments may
								fluctuate due to market conditions, economic factors, and other
								variables beyond our control.
							</p>
							<p>
								<strong>Regulatory Risk:</strong> Changes in regulations may
								affect the availability and performance of certain investment
								products.
							</p>

							<h2>4. Eligibility and Account Requirements</h2>
							<p>To use our services, you must:</p>
							<ul>
								<li>Be at least 18 years of age</li>
								<li>Have legal capacity to enter into binding agreements</li>
								<li>
									Provide accurate and complete information during registration
								</li>
								<li>Comply with all applicable laws and regulations</li>
								<li>Complete any required identity verification processes</li>
							</ul>

							<h2>5. Cryptocurrency Transactions</h2>
							<p>
								All investments are funded through cryptocurrency transactions.
								By using our platform, you acknowledge:
							</p>
							<ul>
								<li>Cryptocurrency transactions are irreversible</li>
								<li>
									You are responsible for the security of your wallet and
									private keys
								</li>
								<li>Network fees may apply to all transactions</li>
								<li>Transaction times may vary based on network congestion</li>
							</ul>

							<h2>6. Fees and Charges</h2>
							<p>Our fee structure includes:</p>
							<ul>
								<li>Management fees for investment products</li>
								<li>Performance fees where applicable</li>
								<li>Transaction fees for cryptocurrency operations</li>
								<li>Withdrawal fees as specified in our fee schedule</li>
							</ul>

							<h2>7. Privacy and Data Protection</h2>
							<p>
								We are committed to protecting your privacy and personal
								information. Please refer to our Privacy Policy for detailed
								information about how we collect, use, and protect your data.
							</p>

							<h2>8. Limitation of Liability</h2>
							<p>
								MultiXcapital shall not be liable for any indirect, incidental,
								special, consequential, or punitive damages, including but not
								limited to loss of profits, data, or use, incurred by you or any
								third party, whether in an action in contract or tort.
							</p>

							<h2>9. Termination</h2>
							<p>
								We reserve the right to terminate or suspend your account at any
								time, with or without cause, and with or without notice. Upon
								termination, your right to use the service will cease
								immediately.
							</p>

							<h2>10. Governing Law</h2>
							<p>
								These Terms and Conditions shall be governed by and construed in
								accordance with the laws of the jurisdiction in which
								MultiXcapital operates, without regard to its conflict of law
								provisions.
							</p>

							<h2>11. Changes to Terms</h2>
							<p>
								We reserve the right to modify these Terms and Conditions at any
								time. We will notify users of any material changes via email or
								through our platform. Continued use of our services after such
								modifications constitutes acceptance of the updated terms.
							</p>

							<h2>12. Contact Information</h2>
							<p>
								If you have any questions about these Terms and Conditions,
								please contact us at:
							</p>
							<ul>
								<li>Email: legal@multixcapital.com</li>
								<li>Phone: +1 (555) 123-4567</li>
								<li>Address: 123 Financial District, New York, NY 10004</li>
							</ul>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
