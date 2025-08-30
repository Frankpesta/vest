import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, User, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { mockBlogPosts } from "@/mocks/data";

export default function BlogPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
			{/* Hero Section */}
			<section className="py-20 px-4">
				<div className="max-w-4xl mx-auto text-center">
					<h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
						Investment Insights & Market Analysis
					</h1>
					<p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
						Stay informed with the latest trends in crypto, real estate, and
						traditional investments
					</p>

					{/* Search Bar */}
					<div className="max-w-md mx-auto relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
						<Input
							placeholder="Search articles..."
							className="pl-10 bg-white dark:bg-slate-800"
						/>
					</div>
				</div>
			</section>

			{/* Featured Post */}
			<section className="px-4 mb-16">
				<div className="max-w-6xl mx-auto">
					<div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-xl">
						<div className="md:flex">
							<div className="md:w-1/2">
								<Image
									src="/defi-institutional-investment-blockchain-finance.png"
									alt="Featured Article"
									width={600}
									height={400}
									className="w-full h-64 md:h-full object-cover"
								/>
							</div>
							<div className="md:w-1/2 p-8">
								<Badge className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
									Featured
								</Badge>
								<h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
									The Future of DeFi: Institutional Adoption in 2024
								</h2>
								<p className="text-slate-600 dark:text-slate-300 mb-6">
									Explore how major financial institutions are embracing
									decentralized finance and what this means for retail
									investors.
								</p>
								<div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-6">
									<User className="h-4 w-4 mr-2" />
									<span className="mr-4">Sarah Chen</span>
									<Calendar className="h-4 w-4 mr-2" />
									<span>Dec 15, 2024</span>
								</div>
								<Link href="/blog/defi-institutional-adoption-2024">
									<Button className="bg-blue-600 hover:bg-blue-700">
										Read Article <ArrowRight className="ml-2 h-4 w-4" />
									</Button>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Blog Posts Grid */}
			<section className="px-4 pb-20">
				<div className="max-w-6xl mx-auto">
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
						{mockBlogPosts.map((post) => (
							<Card
								key={post.id}
								className="bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow">
								<div className="relative">
									<Image
										src={post.image || "/placeholder.svg"}
										alt={post.title}
										width={400}
										height={200}
										className="w-full h-48 object-cover rounded-t-lg"
									/>
									<Badge className="absolute top-4 left-4 bg-white/90 text-slate-800">
										{post.category}
									</Badge>
								</div>
								<CardHeader>
									<CardTitle className="text-lg hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
										<Link href={`/blog/${post.slug}`}>{post.title}</Link>
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-3">
										{post.excerpt}
									</p>
									<div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
										<div className="flex items-center">
											<User className="h-4 w-4 mr-1" />
											<span>{post.author}</span>
										</div>
										<div className="flex items-center">
											<Calendar className="h-4 w-4 mr-1" />
											<span>{post.date}</span>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					{/* Load More Button */}
					<div className="text-center mt-12">
						<Button variant="outline" size="lg">
							Load More Articles
						</Button>
					</div>
				</div>
			</section>
		</div>
	);
}
