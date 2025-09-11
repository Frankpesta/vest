"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	Calendar,
	User,
	Clock,
	Share2,
	BookmarkPlus,
	ArrowLeft,
	Eye,
	Heart,
	Tag
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "sonner"

export default function BlogPostPage({ params }: { params: { id: string } }) {
	// Fetch blog post by slug
	const blogPost = useQuery(api.blog.getBlogPostBySlug, { slug: params.id })
	const likeBlogPost = useMutation(api.blog.likeBlogPost)

	const handleLike = async () => {
		if (!blogPost) return
		
		try {
			await likeBlogPost({ postId: blogPost._id as any })
			toast.success("Post liked!")
		} catch (error) {
			toast.error("Failed to like post")
		}
	}

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	}

	const formatReadTime = (minutes: number) => {
		return `${minutes} min read`
	}

	if (blogPost === undefined) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
				<LoadingSpinner size="lg" />
			</div>
		)
	}

	if (!blogPost) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
				<EmptyState
					icon={Calendar}
					title="Blog post not found"
					description="The blog post you're looking for doesn't exist or has been removed."
				/>
			</div>
		)
	}

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
						src={blogPost.featuredImage ? "/placeholder.svg" : "/placeholder.svg"}
						alt={blogPost.title}
						width={800}
						height={400}
						className="w-full h-64 md:h-96 object-cover"
					/>
					<div className="p-8">
						<div className="flex items-center justify-between mb-4">
							<Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
								{blogPost.category}
							</Badge>
							{blogPost.isFeatured && (
								<Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
									Featured
								</Badge>
							)}
						</div>
						
						<h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
							{blogPost.title}
						</h1>
						
						<p className="text-xl text-slate-600 dark:text-slate-300 mb-6">
							{blogPost.excerpt}
						</p>

						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-6 text-sm text-slate-500 dark:text-slate-400">
								<div className="flex items-center">
									<User className="h-4 w-4 mr-2" />
									<span>{blogPost.authorName}</span>
								</div>
								<div className="flex items-center">
									<Calendar className="h-4 w-4 mr-2" />
									<span>{formatDate(blogPost.publishedAt || blogPost.createdAt)}</span>
								</div>
								{blogPost.readTime && (
									<div className="flex items-center">
										<Clock className="h-4 w-4 mr-2" />
										<span>{formatReadTime(blogPost.readTime)}</span>
									</div>
								)}
								<div className="flex items-center">
									<Eye className="h-4 w-4 mr-2" />
									<span>{blogPost.viewCount} views</span>
								</div>
							</div>

							<div className="flex items-center space-x-2">
								<Button
									variant="outline"
									size="sm"
									onClick={handleLike}
									className="flex items-center"
								>
									<Heart className="h-4 w-4 mr-1" />
									{blogPost.likeCount}
								</Button>
								<Button variant="outline" size="sm">
									<Share2 className="h-4 w-4 mr-1" />
									Share
								</Button>
								<Button variant="outline" size="sm">
									<BookmarkPlus className="h-4 w-4 mr-1" />
									Save
								</Button>
							</div>
						</div>
					</div>
				</div>

				{/* Article Content */}
				<Card className="bg-white dark:bg-slate-800 shadow-xl">
					<CardContent className="p-8">
						<div className="prose prose-slate dark:prose-invert max-w-none">
							<div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
								{blogPost.content}
							</div>
						</div>

						{/* Tags */}
						{blogPost.tags && blogPost.tags.length > 0 && (
							<div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
								<div className="flex items-center mb-4">
									<Tag className="h-4 w-4 mr-2 text-slate-500" />
									<span className="text-sm font-medium text-slate-600 dark:text-slate-400">Tags</span>
								</div>
								<div className="flex flex-wrap gap-2">
									{blogPost.tags.map((tag, index) => (
										<Badge key={index} variant="outline" className="text-xs">
											{tag}
										</Badge>
									))}
								</div>
							</div>
						)}

						{/* Author Bio */}
						<div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
							<div className="flex items-start space-x-4">
								<div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
									<User className="h-6 w-6 text-slate-500" />
								</div>
								<div>
									<h3 className="font-semibold text-slate-900 dark:text-white">
										{blogPost.authorName}
									</h3>
									<p className="text-sm text-slate-600 dark:text-slate-400">
										Author of this article
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Related Articles */}
				<div className="mt-12">
					<h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
						Related Articles
					</h2>
					<div className="grid md:grid-cols-2 gap-6">
						{/* This would be populated with related articles in a real app */}
						<Card className="bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow">
							<CardContent className="p-6">
								<h3 className="font-semibold text-slate-900 dark:text-white mb-2">
									More articles coming soon...
								</h3>
								<p className="text-sm text-slate-600 dark:text-slate-400">
									We're working on bringing you more great content!
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	)
}