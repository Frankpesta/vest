"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Calendar, User, ArrowRight, Eye, Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"

export default function BlogPage() {
	const [searchTerm, setSearchTerm] = useState("")
	const [selectedCategory, setSelectedCategory] = useState("all")

	// Fetch data from backend
	const blogPosts = useQuery(api.blog.getPublishedBlogPosts, { limit: 20 })
	const featuredPosts = useQuery(api.blog.getPublishedBlogPosts, { featured: true, limit: 1 })
	const categories = useQuery(api.blog.getBlogCategories, {})
	const blogStats = useQuery(api.blog.getBlogStats, {})

	const filteredPosts = blogPosts?.filter((post) => {
		const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
							 post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
							 post.authorName.toLowerCase().includes(searchTerm.toLowerCase())
		const matchesCategory = selectedCategory === "all" || post.category === selectedCategory
		return matchesSearch && matchesCategory
	}) || []

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	}

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
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 bg-white dark:bg-slate-800"
						/>
					</div>
				</div>
			</section>

			{/* Featured Post */}
			{featuredPosts && featuredPosts.length > 0 && (
				<section className="px-4 mb-16">
					<div className="max-w-6xl mx-auto">
						<Card className="bg-white dark:bg-slate-800 overflow-hidden shadow-xl">
							<div className="md:flex">
								<div className="md:w-1/2">
									<Image
										src={featuredPosts[0].featuredImage ? "/placeholder.svg" : "/placeholder.svg"}
										alt={featuredPosts[0].title}
										width={600}
										height={400}
										className="w-full h-64 md:h-full object-cover"
									/>
								</div>
								<div className="md:w-1/2 p-8">
									<Badge className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
										Featured
									</Badge>
									<h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
										{featuredPosts[0].title}
									</h2>
									<p className="text-slate-600 dark:text-slate-300 mb-6 text-lg">
										{featuredPosts[0].excerpt}
									</p>
									<div className="flex items-center justify-between">
										<div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
											<div className="flex items-center">
												<User className="h-4 w-4 mr-1" />
												<span>{featuredPosts[0].authorName}</span>
											</div>
											<div className="flex items-center">
												<Calendar className="h-4 w-4 mr-1" />
												<span>{formatDate(featuredPosts[0].publishedAt || featuredPosts[0].createdAt)}</span>
											</div>
											<div className="flex items-center">
												<Eye className="h-4 w-4 mr-1" />
												<span>{featuredPosts[0].viewCount}</span>
											</div>
										</div>
										<Link href={`/blog/${featuredPosts[0].slug}`}>
											<Button className="bg-blue-600 hover:bg-blue-700">
												Read More
												<ArrowRight className="ml-2 h-4 w-4" />
											</Button>
										</Link>
									</div>
								</div>
							</div>
						</Card>
					</div>
				</section>
			)}

			{/* Category Filter */}
			{categories && categories.length > 0 && (
				<section className="px-4 mb-8">
					<div className="max-w-6xl mx-auto">
						<div className="flex flex-wrap gap-2 justify-center">
							<Button
								variant={selectedCategory === "all" ? "default" : "outline"}
								onClick={() => setSelectedCategory("all")}
							>
								All
							</Button>
							{categories.map((category) => (
								<Button
									key={category}
									variant={selectedCategory === category ? "default" : "outline"}
									onClick={() => setSelectedCategory(category)}
								>
									{category}
								</Button>
							))}
						</div>
					</div>
				</section>
			)}

			{/* Blog Posts Grid */}
			<section className="px-4 pb-20">
				<div className="max-w-6xl mx-auto">
					{blogPosts === undefined ? (
						<div className="flex items-center justify-center py-8">
							<LoadingSpinner size="lg" />
						</div>
					) : filteredPosts.length === 0 ? (
						<EmptyState
							icon={Search}
							title="No blog posts found"
							description={searchTerm || selectedCategory !== "all"
								? "Try adjusting your search or filter criteria."
								: "No blog posts have been published yet."
							}
						/>
					) : (
						<>
							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
								{filteredPosts.map((post) => (
									<Card
										key={post._id}
										className="bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow">
										<div className="relative">
											<Image
												src={post.featuredImage ? "/placeholder.svg" : "/placeholder.svg"}
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
													<span>{post.authorName}</span>
												</div>
												<div className="flex items-center space-x-2">
													<div className="flex items-center">
														<Eye className="h-4 w-4 mr-1" />
														<span>{post.viewCount}</span>
													</div>
													<div className="flex items-center">
														<Heart className="h-4 w-4 mr-1" />
														<span>{post.likeCount}</span>
													</div>
												</div>
											</div>
											<div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
												<Calendar className="h-4 w-4 mr-1 inline" />
												{formatDate(post.publishedAt || post.createdAt)}
											</div>
										</CardContent>
									</Card>
								))}
							</div>

							{/* Load More Button */}
							{filteredPosts.length >= 20 && (
								<div className="text-center mt-12">
									<Button variant="outline" size="lg">
										Load More Articles
									</Button>
								</div>
							)}
						</>
					)}
				</div>
			</section>
		</div>
	)
}