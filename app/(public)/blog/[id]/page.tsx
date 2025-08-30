import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Calendar,
	User,
	Clock,
	Share2,
	BookmarkPlus,
	ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { mockBlogPosts } from "@/mocks/data";

export default function BlogPostPage({ params }: { params: { id: string } }) {
	// In a real app, you'd fetch the post by ID
	const post = mockBlogPosts[0]; // Using first post as example

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
			<div className="max-w-4xl mx-auto px-4 py-8">
				{/* Back Button */}
				<Link href="/blog">
					<Button variant="ghost" className="mb-8">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Blog
					</Button>
				</Link>

				{/* Article Header */}
				<div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-xl mb-8">
					<Image
						src={post.image || "/placeholder.svg"}
						alt={post.title}
						width={800}
						height={400}
						className="w-full h-64 md:h-80 object-cover"
					/>

					<div className="p-8">
						<Badge className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
							{post.category}
						</Badge>

						<h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
							{post.title}
						</h1>

						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center space-x-6 text-slate-600 dark:text-slate-300">
								<div className="flex items-center">
									<User className="h-4 w-4 mr-2" />
									<span>{post.author}</span>
								</div>
								<div className="flex items-center">
									<Calendar className="h-4 w-4 mr-2" />
									<span>{post.date}</span>
								</div>
								<div className="flex items-center">
									<Clock className="h-4 w-4 mr-2" />
									<span>{post.readTime}</span>
								</div>
							</div>

							<div className="flex items-center space-x-2">
								<Button variant="outline" size="sm">
									<Share2 className="h-4 w-4 mr-2" />
									Share
								</Button>
								<Button variant="outline" size="sm">
									<BookmarkPlus className="h-4 w-4 mr-2" />
									Save
								</Button>
							</div>
						</div>

						<p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
							{post.excerpt}
						</p>
					</div>
				</div>

				{/* Article Content */}
				<Card className="bg-white dark:bg-slate-800 mb-8">
					<CardContent className="p-8">
						<div className="prose prose-lg dark:prose-invert max-w-none">
							<h2>The Rise of Institutional DeFi Adoption</h2>
							<p>
								The decentralized finance (DeFi) landscape has undergone a
								remarkable transformation in 2024, with institutional investors
								increasingly recognizing the potential of blockchain-based
								financial services. This shift represents a fundamental change
								in how traditional finance views cryptocurrency and
								decentralized protocols.
							</p>

							<h3>Key Drivers of Institutional Interest</h3>
							<p>
								Several factors have contributed to this growing institutional
								adoption:
							</p>
							<ul>
								<li>
									<strong>Regulatory Clarity:</strong> Clearer guidelines from
									regulatory bodies have reduced uncertainty
								</li>
								<li>
									<strong>Improved Infrastructure:</strong> Better custody
									solutions and institutional-grade platforms
								</li>
								<li>
									<strong>Yield Opportunities:</strong> Attractive returns
									compared to traditional fixed-income products
								</li>
								<li>
									<strong>Risk Management:</strong> Advanced tools for managing
									DeFi-specific risks
								</li>
							</ul>

							<h3>Impact on Retail Investors</h3>
							<p>
								This institutional influx has significant implications for
								retail investors. While it brings legitimacy and liquidity to
								DeFi protocols, it also introduces new dynamics that individual
								investors must understand and navigate.
							</p>

							<blockquote>
								"The entry of institutional capital into DeFi represents a
								maturation of the space, but retail investors must adapt their
								strategies accordingly." - DeFi Research Institute
							</blockquote>

							<h3>Looking Ahead</h3>
							<p>
								As we move forward, the convergence of traditional finance and
								DeFi will likely accelerate, creating new opportunities and
								challenges for all market participants.
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Related Articles */}
				<Card className="bg-white dark:bg-slate-800">
					<CardContent className="p-8">
						<h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
							Related Articles
						</h3>
						<div className="grid md:grid-cols-2 gap-6">
							{mockBlogPosts.slice(1, 3).map((relatedPost) => (
								<Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
									<div className="flex space-x-4 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
										<Image
											src={relatedPost.image || "/placeholder.svg"}
											alt={relatedPost.title}
											width={80}
											height={80}
											className="w-20 h-20 object-cover rounded-lg"
										/>
										<div>
											<h4 className="font-semibold text-slate-900 dark:text-white mb-2">
												{relatedPost.title}
											</h4>
											<p className="text-sm text-slate-600 dark:text-slate-300">
												{relatedPost.date}
											</p>
										</div>
									</div>
								</Link>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
