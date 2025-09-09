"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  MoreHorizontal,
  FileText,
  TrendingUp,
  DollarSign,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  X,
  Loader2
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { toast } from "sonner"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { PlanModal } from "@/components/admin/plan-modal"
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

export default function AdminPlansPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedTier, setSelectedTier] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<any>(null)
  const [deletingPlan, setDeletingPlan] = useState<any>(null)
  const [isSeeding, setIsSeeding] = useState(false)
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")

  // Fetch plans from backend
  const plans = useQuery(api.investmentPlans.getActivePlans, {})
  
  // Mutations
  const deletePlan = useMutation(api.investmentPlans.deletePlan)
  const seedPlans = useMutation(api.investmentPlans.seedPlans)

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "crypto", label: "Crypto" },
    { value: "real-estate", label: "Real Estate" },
    { value: "reits", label: "REITs" },
    { value: "forex", label: "Forex" },
    { value: "retirement", label: "Retirement" },
    { value: "children", label: "Children" },
  ]

  const tiers = [
    { value: "all", label: "All Tiers" },
    { value: "starter", label: "Starter" },
    { value: "professional", label: "Professional" },
    { value: "enterprise", label: "Enterprise" },
  ]

  const sortOptions = [
    { value: "name", label: "Name" },
    { value: "category", label: "Category" },
    { value: "tier", label: "Tier" },
    { value: "minInvestment", label: "Min Investment" },
    { value: "maxAPY", label: "Max APY" },
    { value: "duration", label: "Duration" },
    { value: "totalInvestors", label: "Investors" },
    { value: "totalInvested", label: "Total Invested" },
  ]

  const filteredAndSortedPlans = plans?.filter((plan) => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || plan.category === selectedCategory
    const matchesTier = selectedTier === "all" || plan.tier === selectedTier
    return matchesSearch && matchesCategory && matchesTier
  }).sort((a, b) => {
    let aValue = a[sortBy as keyof typeof a]
    let bValue = b[sortBy as keyof typeof b]
    
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

  const handleCreatePlan = () => {
    setEditingPlan(null)
    setIsPlanModalOpen(true)
  }

  const handleEditPlan = (plan: any) => {
    setEditingPlan(plan)
    setIsPlanModalOpen(true)
  }

  const handleDeletePlan = async (planId: string) => {
    try {
      await deletePlan({ planId: planId as any })
      toast.success("Plan deleted successfully")
      setDeletingPlan(null)
    } catch (error) {
      toast.error("Failed to delete plan")
      console.error(error)
    }
  }

  const handleSeedPlans = async () => {
    setIsSeeding(true)
    try {
      const result = await seedPlans({})
      toast.success(`Successfully seeded ${result.insertedCount} investment plans!`)
    } catch (error) {
      toast.error("Failed to seed plans")
      console.error(error)
    } finally {
      setIsSeeding(false)
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        <CheckCircle className="mr-1 h-3 w-3" />
        Active
      </Badge>
    ) : (
      <Badge variant="outline">
        <X className="mr-1 h-3 w-3" />
        Inactive
      </Badge>
    )
  }

  const getCategoryBadge = (category: string) => {
    const colors = {
      crypto: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "real-estate": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      reits: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      forex: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      retirement: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      children: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    }
    
    return (
      <Badge className={colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {category.replace("-", " ").toUpperCase()}
      </Badge>
    )
  }

  const getTierBadge = (tier: string) => {
    const colors = {
      starter: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      professional: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      enterprise: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    }
    
    return (
      <Badge className={colors[tier as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {tier.toUpperCase()}
      </Badge>
    )
  }

  const getRiskBadge = (riskLevel: string) => {
    const colors = {
      low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      "low-medium": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      medium: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      "medium-high": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    }
    
    return (
      <Badge className={colors[riskLevel as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {riskLevel.replace("-", " ").toUpperCase()}
      </Badge>
    )
  }

  // Calculate statistics
  const stats = {
    totalPlans: plans?.length || 0,
    activePlans: plans?.filter(p => p.isActive).length || 0,
    totalInvestors: plans?.reduce((sum, p) => sum + p.totalInvestors, 0) || 0,
    totalInvested: plans?.reduce((sum, p) => sum + p.totalInvested, 0) || 0,
    popularPlans: plans?.filter(p => p.popular).length || 0,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Investment Plans</h1>
          <p className="text-slate-600 dark:text-slate-300">Manage investment plans and categories</p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Seed Plans Button - One time use */}
          {plans && plans.length === 0 && (
            <Button
              onClick={handleSeedPlans}
              disabled={isSeeding}
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Seed Plans
                </>
              )}
            </Button>
          )}
          <Button onClick={handleCreatePlan} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Plan
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Plans</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalPlans}</p>
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
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Active Plans</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.activePlans}</p>
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
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Investors</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalInvestors}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Invested</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">${stats.totalInvested.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Popular Plans</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.popularPlans}</p>
              </div>
              <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-slate-800">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search and View Mode */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  onClick={() => setViewMode("table")}
                  size="sm"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Table
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  onClick={() => setViewMode("grid")}
                  size="sm"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Grid
                </Button>
              </div>
            </div>

            {/* Filter Options */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 self-center">Category:</span>
                {categories.map((category) => (
                  <Button
                    key={category.value}
                    variant={selectedCategory === category.value ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.value)}
                    size="sm"
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 self-center">Tier:</span>
                {tiers.map((tier) => (
                  <Button
                    key={tier.value}
                    variant={selectedTier === tier.value ? "default" : "outline"}
                    onClick={() => setSelectedTier(tier.value)}
                    size="sm"
                  >
                    {tier.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Sort by:</span>
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

      {/* Plans Display */}
      <Card className="bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Investment Plans ({filteredAndSortedPlans.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {plans === undefined ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredAndSortedPlans.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No investment plans found"
              description={searchTerm || selectedCategory !== "all" || selectedTier !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Create your first investment plan to get started."
              }
            />
          ) : viewMode === "table" ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Details</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Investment Range</TableHead>
                    <TableHead>APY</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stats</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedPlans.map((plan) => (
                    <TableRow key={plan._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <TableCell>
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white">{plan.name}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                            {plan.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-slate-500">{plan.price}</span>
                            <span className="text-xs text-slate-500">•</span>
                            <span className="text-xs text-slate-500">{plan.priceUSD}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getCategoryBadge(plan.category)}
                      </TableCell>
                      <TableCell>
                        {getTierBadge(plan.tier)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">${plan.minInvestment.toLocaleString()}</p>
                          <p className="text-slate-500">to ${plan.maxInvestment.toLocaleString()}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium text-green-600 dark:text-green-400">{plan.apy}</p>
                          <p className="text-slate-500">{plan.minAPY}% - {plan.maxAPY}%</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-1 h-4 w-4 text-slate-400" />
                          {plan.duration} days
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRiskBadge(plan.riskLevel)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(plan.isActive)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center text-slate-600 dark:text-slate-300">
                            <Users className="mr-1 h-4 w-4" />
                            {plan.totalInvestors}
                          </div>
                          <div className="flex items-center text-slate-600 dark:text-slate-300">
                            <DollarSign className="mr-1 h-4 w-4" />
                            ${plan.totalInvested.toLocaleString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPlan(plan)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingPlan(plan)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            // Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedPlans.map((plan) => (
                <Card key={plan._id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-lg">{plan.name}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{plan.description}</p>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        {getStatusBadge(plan.isActive)}
                        {plan.popular && (
                          <Badge className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
                            Popular
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      {getCategoryBadge(plan.category)}
                      {getTierBadge(plan.tier)}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-300">Investment Range</span>
                        <span className="font-medium">${plan.minInvestment.toLocaleString()} - ${plan.maxInvestment.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-300">APY</span>
                        <span className="font-medium text-green-600 dark:text-green-400">{plan.apy}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-300">Duration</span>
                        <span className="font-medium">{plan.duration} days</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-300">Risk Level</span>
                        {getRiskBadge(plan.riskLevel)}
                      </div>
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-600 dark:text-slate-300">Investors</span>
                        <span className="font-medium">{plan.totalInvestors}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-300">Total Invested</span>
                        <span className="font-medium">${plan.totalInvested.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPlan(plan)}
                        className="flex-1"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingPlan(plan)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Modal */}
      <PlanModal
        isOpen={isPlanModalOpen}
        onClose={() => {
          setIsPlanModalOpen(false)
          setEditingPlan(null)
        }}
        plan={editingPlan}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingPlan} onOpenChange={() => setDeletingPlan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Investment Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingPlan?.name}"? This action cannot be undone.
              {deletingPlan?.totalInvestors > 0 && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                    <span className="text-sm text-red-800 dark:text-red-200">
                      This plan has {deletingPlan.totalInvestors} active investors and cannot be deleted.
                    </span>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingPlan && handleDeletePlan(deletingPlan._id)}
              disabled={deletingPlan?.totalInvestors > 0}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

