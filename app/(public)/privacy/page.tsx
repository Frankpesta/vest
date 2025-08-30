import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
			<div className="max-w-4xl mx-auto px-4 py-16">
				<div className="text-center mb-12">
					<h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
						Privacy Policy
					</h1>
					<p className="text-xl text-slate-600 dark:text-slate-300">
						Last updated: December 15, 2024
					</p>
				</div>

				<Card className="bg-white dark:bg-slate-800">
					<CardContent className="p-8">
						<div className="prose prose-lg dark:prose-invert max-w-none">
							<h2>1. Information We Collect</h2>
							<p>
								We collect information you provide directly to us, such as when
								you create an account, make investments, or contact us for
								support.
							</p>

							<h3>Personal Information</h3>
							<ul>
								<li>Name, email address, and contact information</li>
								<li>Government-issued identification for KYC compliance</li>
								<li>Financial information and investment preferences</li>
								<li>Cryptocurrency wallet addresses and transaction history</li>
							</ul>

							<h3>Automatically Collected Information</h3>
							<ul>
								<li>Device information and IP addresses</li>
								<li>Usage data and platform interactions</li>
								<li>Cookies and similar tracking technologies</li>
								<li>Location data (with your consent)</li>
							</ul>

							<h2>2. How We Use Your Information</h2>
							<p>We use the information we collect to:</p>
							<ul>
								<li>Provide and maintain our investment services</li>
								<li>Process transactions and manage your investments</li>
								<li>Comply with legal and regulatory requirements</li>
								<li>Communicate with you about your account and services</li>
								<li>Improve our platform and develop new features</li>
								<li>Detect and prevent fraud and security threats</li>
							</ul>

							<h2>3. Information Sharing and Disclosure</h2>
							<p>
								We may share your information in the following circumstances:
							</p>

							<h3>Service Providers</h3>
							<p>
								We may share information with third-party service providers who
								perform services on our behalf, such as payment processing, data
								analysis, and customer support.
							</p>

							<h3>Legal Requirements</h3>
							<p>
								We may disclose information if required by law, regulation, or
								legal process, or to protect the rights, property, or safety of
								MultiXcapital, our users, or others.
							</p>

							<h3>Business Transfers</h3>
							<p>
								In the event of a merger, acquisition, or sale of assets, your
								information may be transferred as part of that transaction.
							</p>

							<h2>4. Data Security</h2>
							<p>
								We implement appropriate technical and organizational measures
								to protect your personal information:
							</p>
							<ul>
								<li>Encryption of sensitive data in transit and at rest</li>
								<li>Multi-factor authentication for account access</li>
								<li>Regular security audits and penetration testing</li>
								<li>
									Limited access to personal information on a need-to-know basis
								</li>
								<li>Secure data centers with physical access controls</li>
							</ul>

							<h2>5. Your Rights and Choices</h2>
							<p>
								Depending on your location, you may have certain rights
								regarding your personal information:
							</p>
							<ul>
								<li>
									<strong>Access:</strong> Request access to your personal
									information
								</li>
								<li>
									<strong>Correction:</strong> Request correction of inaccurate
									information
								</li>
								<li>
									<strong>Deletion:</strong> Request deletion of your personal
									information
								</li>
								<li>
									<strong>Portability:</strong> Request a copy of your
									information in a portable format
								</li>
								<li>
									<strong>Objection:</strong> Object to certain processing of
									your information
								</li>
							</ul>

							<h2>6. Cookies and Tracking Technologies</h2>
							<p>We use cookies and similar technologies to:</p>
							<ul>
								<li>Remember your preferences and settings</li>
								<li>Analyze platform usage and performance</li>
								<li>Provide personalized content and recommendations</li>
								<li>Detect and prevent fraud</li>
							</ul>
							<p>
								You can control cookies through your browser settings, but
								disabling cookies may affect the functionality of our platform.
							</p>

							<h2>7. International Data Transfers</h2>
							<p>
								Your information may be transferred to and processed in
								countries other than your country of residence. We ensure
								appropriate safeguards are in place to protect your information
								during such transfers.
							</p>

							<h2>8. Data Retention</h2>
							<p>
								We retain your personal information for as long as necessary to
								provide our services and comply with legal obligations. When we
								no longer need your information, we will securely delete or
								anonymize it.
							</p>

							<h2>9. Children's Privacy</h2>
							<p>
								Our services are not intended for individuals under the age of
								18. We do not knowingly collect personal information from
								children under 18. If we become aware that we have collected
								such information, we will take steps to delete it.
							</p>

							<h2>10. Changes to This Privacy Policy</h2>
							<p>
								We may update this Privacy Policy from time to time. We will
								notify you of any material changes by posting the new Privacy
								Policy on our platform and updating the "Last updated" date.
							</p>

							<h2>11. Contact Us</h2>
							<p>
								If you have any questions about this Privacy Policy or our
								privacy practices, please contact us:
							</p>
							<ul>
								<li>Email: privacy@multixcapital.com</li>
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
