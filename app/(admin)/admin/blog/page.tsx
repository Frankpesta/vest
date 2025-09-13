"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  FileText, 
  Search, 
  Filter, 
  MoreHorizontal,
  CheckCircle,
  X,
  Clock,
  Eye,
  Edit,
  Trash2,
  Plus,
  Calendar,
  User,
  Tag,
  TrendingUp,
  Download,
  Upload,
  Image as ImageIcon,
  Globe,
  Archive
} from "lucide-react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { toast } from "sonner"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { FileUpload } from "@/components/ui/file-upload"

export default function AdminBlogPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [featuredImage, setFeaturedImage] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    tags: [] as string[],
    authorId: "",
    authorName: "",
    status: "draft" as "draft" | "published" | "archived",
    readTime: 0,
    isFeatured: false,
    seoTitle: "",
    seoDescription: "",
  })

  // Fetch data from backend
  const blogPosts = useQuery(api.blog.getAllBlogPosts, { limit: 100 })
  const blogStats = useQuery(api.blog.getBlogPostStats, {})
  const categories = useQuery(api.blog.getBlogCategories, {})
  
  // Mutations
  const createBlogPost = useMutation(api.blog.createBlogPost)
  const updateBlogPost = useMutation(api.blog.updateBlogPost)
  const deleteBlogPost = useMutation(api.blog.deleteBlogPost)

  const statuses = [
    { value: "all", label: "All Status" },
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" },
  ]

  const sortOptions = [
    { value: "createdAt", label: "Date Created" },
    { value: "publishedAt", label: "Date Published" },
    { value: "title", label: "Title" },
    { value: "viewCount", label: "Views" },
    { value: "likeCount", label: "Likes" },
  ]

  const filteredAndSortedPosts = blogPosts?.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.authorName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || post.status === selectedStatus
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory
    return matchesSearch && matchesStatus && matchesCategory
  }).sort((a, b) => {
    let aValue = a[sortBy as keyof typeof a]
    let bValue = b[sortBy as keyof typeof b]
    
    // Handle undefined values
    if (aValue === undefined) aValue = ""
    if (bValue === undefined) bValue = ""
    
    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase()
      bValue = (bValue as string).toLowerCase()
    }
    
    if (sortOrder === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  }) || []

  const handleSelectPost = (postId: string) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    )
  }

  const handleSelectAll = () => {
    if (selectedPosts.length === filteredAndSortedPosts.length) {
      setSelectedPosts([])
    } else {
      setSelectedPosts(filteredAndSortedPosts.map(post => post._id))
    }
  }

  const handleCreatePost = async () => {
    if (!formData.title || !formData.slug || !formData.excerpt || !formData.content) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      await createBlogPost({
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        featuredImage: featuredImage || undefined,
        category: formData.category,
        tags: formData.tags,
        authorId: formData.authorId,
        authorName: formData.authorName,
        status: formData.status,
        readTime: formData.readTime,
        isFeatured: formData.isFeatured,
        seoTitle: formData.seoTitle || undefined,
        seoDescription: formData.seoDescription || undefined,
      })
      
      toast.success("Blog post created successfully")
      setIsCreateModalOpen(false)
      resetForm()
    } catch (error) {
      toast.error("Failed to create blog post")
      console.error(error)
    }
  }

  const handleUpdatePost = async () => {
    if (!selectedPost) return

    try {
      await updateBlogPost({
        postId: selectedPost._id as any,
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        featuredImage: featuredImage || undefined,
        category: formData.category,
        tags: formData.tags,
        status: formData.status,
        readTime: formData.readTime,
        isFeatured: formData.isFeatured,
        seoTitle: formData.seoTitle || undefined,
        seoDescription: formData.seoDescription || undefined,
      })
      
      toast.success("Blog post updated successfully")
      setIsPostModalOpen(false)
      resetForm()
    } catch (error) {
      toast.error("Failed to update blog post")
      console.error(error)
    }
  }

  const handleDeletePost = async () => {
    if (!selectedPost) return

    try {
      await deleteBlogPost({ postId: selectedPost._id as any })
      toast.success("Blog post deleted successfully")
      setIsDeleteModalOpen(false)
    } catch (error) {
      toast.error("Failed to delete blog post")
      console.error(error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      category: "",
      tags: [],
      authorId: "",
      authorName: "",
      status: "draft",
      readTime: 0,
      isFeatured: false,
      seoTitle: "",
      seoDescription: "",
    })
    setFeaturedImage(null)
  }

  const openEditModal = (post: any) => {
    setSelectedPost(post)
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      tags: post.tags,
      authorId: post.authorId,
      authorName: post.authorName,
      status: post.status,
      readTime: post.readTime || 0,
      isFeatured: post.isFeatured,
      seoTitle: post.seoTitle || "",
      seoDescription: post.seoDescription || "",
    })
    setFeaturedImage(post.featuredImage || null)
    setIsEditing(true)
    setIsPostModalOpen(true)
  }

  const openCreateModal = () => {
    resetForm()
    setIsEditing(false)
    setIsCreateModalOpen(true)
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <Clock className="mr-1 h-3 w-3" />
          Draft
        </Badge>
      case "published":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle className="mr-1 h-3 w-3" />
          Published
        </Badge>
      case "archived":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
          <Archive className="mr-1 h-3 w-3" />
          Archived
        </Badge>
      default:
        return null
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) {
      return `${minutes}m ago`
    } else if (hours < 24) {
      return `${hours}h ago`
    } else {
      return `${days}d ago`
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Blog Management</h1>
          <p className="text-slate-600 dark:text-slate-300">Create and manage blog posts</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {blogStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Posts</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{blogStats.total}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Published</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{blogStats.published}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Views</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{blogStats.totalViews.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Likes</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{blogStats.totalLikes.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="bg-white dark:bg-slate-800">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search by title, excerpt, or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex space-x-2">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blog Posts Table */}
      <Card className="bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Blog Posts ({filteredAndSortedPosts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {blogPosts === undefined ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredAndSortedPosts.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No blog posts found"
              description={searchTerm || selectedStatus !== "all" || selectedCategory !== "all"
                ? "Try adjusting your search or filter criteria."
                : "No blog posts have been created yet."
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedPosts.length === filteredAndSortedPosts.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Likes</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedPosts.map((post) => (
                    <TableRow key={post._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedPosts.includes(post._id)}
                          onCheckedChange={() => handleSelectPost(post._id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="text-sm max-w-xs">
                          <p className="font-medium truncate">{post.title}</p>
                          <p className="text-slate-500 truncate">{post.excerpt}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{post.authorName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{post.category}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(post.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{post.viewCount.toLocaleString()}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{post.likeCount.toLocaleString()}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatDate(post.createdAt)}</p>
                          <p className="text-slate-500">{formatRelativeTime(post.createdAt)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => {
                              setSelectedPost(post)
                              setIsPostModalOpen(true)
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditModal(post)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedPost(post)
                                setIsDeleteModalOpen(true)
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Post Modal */}
      <Dialog open={isCreateModalOpen || isPostModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false)
          setIsPostModalOpen(false)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Blog Post" : "Create New Blog Post"}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? "Update the blog post details" : "Fill in the details to create a new blog post"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, title: e.target.value }))
                    if (!isEditing) {
                      setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }))
                    }
                  }}
                  placeholder="Enter blog post title"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="blog-post-slug"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt *</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Brief description of the blog post"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your blog post content here..."
                rows={8}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Investing, Technology"
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags.join(", ")}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(",").map(tag => tag.trim()).filter(tag => tag)
                  }))}
                  placeholder="investment, crypto, tips"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="authorName">Author Name *</Label>
                <Input
                  id="authorName"
                  value={formData.authorName}
                  onChange={(e) => setFormData(prev => ({ ...prev, authorName: e.target.value }))}
                  placeholder="Author name"
                />
              </div>
              <div>
                <Label htmlFor="readTime">Read Time (minutes)</Label>
                <Input
                  id="readTime"
                  type="number"
                  value={formData.readTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, readTime: parseInt(e.target.value) || 0 }))}
                  placeholder="5"
                />
              </div>
            </div>

            <div>
              <Label>Featured Image</Label>
              <FileUpload
                onUploadComplete={(fileId) => setFeaturedImage(fileId)}
                accept="image/*"
                maxSize={5 * 1024 * 1024} // 5MB
              />
              {featuredImage && (
                <div className="mt-2">
                  <p className="text-sm text-green-600">Image uploaded successfully</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                />
                <Label htmlFor="isFeatured">Featured Post</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input
                id="seoTitle"
                value={formData.seoTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                placeholder="SEO optimized title"
              />
            </div>

            <div>
              <Label htmlFor="seoDescription">SEO Description</Label>
              <Textarea
                id="seoDescription"
                value={formData.seoDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                placeholder="SEO meta description"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateModalOpen(false)
              setIsPostModalOpen(false)
              resetForm()
            }}>
              Cancel
            </Button>
            <Button onClick={isEditing ? handleUpdatePost : handleCreatePost}>
              {isEditing ? "Update Post" : "Create Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Post Details Modal */}
      <Dialog open={isPostModalOpen && !isEditing} onOpenChange={setIsPostModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Blog Post Details</DialogTitle>
            <DialogDescription>
              Complete information about the selected blog post
            </DialogDescription>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Title</Label>
                  <p className="text-sm font-medium">{selectedPost.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedPost.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Author</Label>
                  <p className="text-sm">{selectedPost.authorName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Category</Label>
                  <p className="text-sm">{selectedPost.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Views</Label>
                  <p className="text-sm">{selectedPost.viewCount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Likes</Label>
                  <p className="text-sm">{selectedPost.likeCount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Created</Label>
                  <p className="text-sm">{formatDate(selectedPost.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Published</Label>
                  <p className="text-sm">{selectedPost.publishedAt ? formatDate(selectedPost.publishedAt) : "Not published"}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Excerpt</Label>
                <p className="text-sm p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  {selectedPost.excerpt}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Content</Label>
                <p className="text-sm p-3 bg-slate-50 dark:bg-slate-700 rounded-lg max-h-40 overflow-y-auto">
                  {selectedPost.content}
                </p>
              </div>

              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedPost.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPostModalOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsPostModalOpen(false)
              openEditModal(selectedPost)
            }}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this blog post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
