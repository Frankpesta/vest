"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  TrendingUp, 
  Search, 
  Filter, 
  MoreHorizontal,
  CheckCircle,
  X,
  Clock,
  AlertTriangle,
  Loader2,
  Download,
  Eye,
  Edit,
  DollarSign,
  PieChart,
  BarChart3,
  Activity,
  User,
  Calendar,
  Pause,
  Play,
  StopCircle
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

export default function AdminInvestmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedPlan, setSelectedPlan] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedInvestments, setSelectedInvestments] = useState<string[]>([])
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null)
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [actionType, setActionType] = useState<string>("")
  const [adminNotes, setAdminNotes] = useState("")

  // Fetch data from backend
  const investments = useQuery(api.adminInvestments.getAllInvestments, { limit: 100 })
  const investmentStats = useQuery(api.adminInvestments.getInvestmentStats, {})
  const investmentPlans = useQuery(api.investmentPlans.getActivePlans, {})
  const performanceData = useQuery(api.adminInvestments.getInvestmentPerformanceData, { days: 30 })
  
  // Mutations
  const updateInvestmentStatus = useMutation(api.adminInvestments.updateInvestmentStatus)

  const statuses = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ]

  const sortOptions = [
    { value: "createdAt", label: "Date" },
    { value: "amount", label: "Amount" },
    { value: "status", label: "Status" },
    { value: "totalReturns", label: "Returns" },
  ]

  const filteredAndSortedInvestments = investments?.filter((investment) => {
    const matchesSearch = investment.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investment.plan?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investment.userProfile?.userId?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || investment.status === selectedStatus
    const matchesPlan = selectedPlan === "all" || investment.planId === selectedPlan
    return matchesSearch && matchesStatus && matchesPlan
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

  const handleSelectInvestment = (investmentId: string) => {
    setSelectedInvestments(prev => 
      prev.includes(investmentId) 
        ? prev.filter(id => id !== investmentId)
        : [...prev, investmentId]
    )
  }

  const handleSelectAll = () => {
    if (selectedInvestments.length === filteredAndSortedInvestments.length) {
      setSelectedInvestments([])
    } else {
      setSelectedInvestments(filteredAndSortedInvestments.map(investment => investment._id))
    }
  }

  const handleInvestmentAction = async (investmentId: string, action: string) => {
    try {
      await updateInvestmentStatus({
        investmentId: investmentId as any,
        status: action as any,
        adminNotes: adminNotes || undefined,
      })
      
      toast.success(`Investment ${action} successfully`)
      setIsActionModalOpen(false)
      setAdminNotes("")
    } catch (error) {
      toast.error(`Failed to ${action} investment`)
      console.error(error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      case "active":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <Play className="mr-1 h-3 w-3" />
          Active
        </Badge>
      case "paused":
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
          <Pause className="mr-1 h-3 w-3" />
          Paused
        </Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          <CheckCircle className="mr-1 h-3 w-3" />
          Completed
        </Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          <StopCircle className="mr-1 h-3 w-3" />
          Cancelled
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const calculateProgress = (investment: any) => {
    if (!investment.plan?.duration || !investment.createdAt) return 0
    const elapsed = Date.now() - investment.createdAt
    const total = investment.plan.duration * 24 * 60 * 60 * 1000
    return Math.min((elapsed / total) * 100, 100)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Investment Management</h1>
          <p className="text-slate-600 dark:text-slate-300">Monitor and manage all user investments</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {investmentStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Investments</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{investmentStats.total}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Active</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{investmentStats.active}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <Play className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Invested</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(investmentStats.totalInvested)}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Returns</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(investmentStats.totalReturns)}</p>
                </div>
                <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center">
                  <PieChart className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Chart */}
      {performanceData && performanceData.length > 0 && (
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Investment Performance (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end space-x-2">
              {performanceData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t"
                    style={{ 
                      height: `${Math.max((data.totalAmount / Math.max(...performanceData.map(d => d.totalAmount))) * 200, 4)}px` 
                    }}
                  />
                  <span className="text-xs text-slate-500 mt-2">
                    {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="bg-white dark:bg-slate-800">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search and Sort */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search by user ID, plan name, or user..."
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
                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    {investmentPlans?.map((plan) => (
                      <SelectItem key={plan._id} value={plan._id}>
                        {plan.name}
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

      {/* Investments Table */}
      <Card className="bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Investments ({filteredAndSortedInvestments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {investments === undefined ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredAndSortedInvestments.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No investments found"
              description={searchTerm || selectedStatus !== "all" || selectedPlan !== "all"
                ? "Try adjusting your search or filter criteria."
                : "No investments have been made yet."
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedInvestments.length === filteredAndSortedInvestments.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Returns</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedInvestments.map((investment) => (
                    <TableRow key={investment._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedInvestments.includes(investment._id)}
                          onCheckedChange={() => handleSelectInvestment(investment._id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {investment.userId.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {investment.userId.slice(0, 8)}...
                            </p>
                            <p className="text-sm text-slate-500">
                              {investment.userProfile?.firstName} {investment.userProfile?.lastName}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{investment.plan?.name}</p>
                          <p className="text-slate-500">{investment.plan?.category}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{formatCurrency(investment.amount || 0)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-20">
                          <div className="bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${calculateProgress(investment)}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {Math.round(calculateProgress(investment))}%
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium text-green-600">
                            {formatCurrency(investment.totalReturns || 0)}
                          </p>
                          <p className="text-slate-500">
                            {investment.plan?.expectedReturn}% APY
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(investment.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatDate(investment.createdAt)}</p>
                          <p className="text-slate-500">{formatRelativeTime(investment.createdAt)}</p>
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
                              setSelectedInvestment(investment)
                              setIsInvestmentModalOpen(true)
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {investment.status === "pending" && (
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedInvestment(investment)
                                  setActionType("active")
                                  setIsActionModalOpen(true)
                                }}
                                className="text-green-600"
                              >
                                <Play className="mr-2 h-4 w-4" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            {investment.status === "active" && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedInvestment(investment)
                                    setActionType("paused")
                                    setIsActionModalOpen(true)
                                  }}
                                  className="text-orange-600"
                                >
                                  <Pause className="mr-2 h-4 w-4" />
                                  Pause
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedInvestment(investment)
                                    setActionType("completed")
                                    setIsActionModalOpen(true)
                                  }}
                                  className="text-blue-600"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Complete
                                </DropdownMenuItem>
                              </>
                            )}
                            {investment.status === "paused" && (
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedInvestment(investment)
                                  setActionType("active")
                                  setIsActionModalOpen(true)
                                }}
                                className="text-green-600"
                              >
                                <Play className="mr-2 h-4 w-4" />
                                Resume
                              </DropdownMenuItem>
                            )}
                            {(investment.status === "pending" || investment.status === "active" || investment.status === "paused") && (
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedInvestment(investment)
                                  setActionType("cancelled")
                                  setIsActionModalOpen(true)
                                }}
                                className="text-red-600"
                              >
                                <StopCircle className="mr-2 h-4 w-4" />
                                Cancel
                              </DropdownMenuItem>
                            )}
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

      {/* Investment Details Modal */}
      <Dialog open={isInvestmentModalOpen} onOpenChange={setIsInvestmentModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Investment Details</DialogTitle>
            <DialogDescription>
              Complete information about the selected investment
            </DialogDescription>
          </DialogHeader>
          {selectedInvestment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Investment ID</Label>
                  <p className="text-sm font-mono">{selectedInvestment._id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedInvestment.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Amount</Label>
                  <p className="text-sm font-medium">{formatCurrency(selectedInvestment.amount || 0)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Returns</Label>
                  <p className="text-sm font-medium text-green-600">{formatCurrency(selectedInvestment.totalReturns || 0)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">User ID</Label>
                  <p className="text-sm font-mono">{selectedInvestment.userId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Created</Label>
                  <p className="text-sm">{formatDate(selectedInvestment.createdAt)}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Plan Details</Label>
                <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <p className="font-medium">{selectedInvestment.plan?.name}</p>
                  <p className="text-sm text-slate-500">{selectedInvestment.plan?.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm">
                    <span>APY: {selectedInvestment.plan?.expectedReturn}%</span>
                    <span>Duration: {selectedInvestment.plan?.duration} days</span>
                    <span>Category: {selectedInvestment.plan?.category}</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Progress</Label>
                <div className="mt-2">
                  <div className="bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${calculateProgress(selectedInvestment)}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {Math.round(calculateProgress(selectedInvestment))}% complete
                  </p>
                </div>
              </div>

              {selectedInvestment.adminNotes && (
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Admin Notes</Label>
                  <p className="text-sm p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    {selectedInvestment.adminNotes}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInvestmentModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Modal */}
      <AlertDialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "active" ? "Activate Investment" : 
               actionType === "paused" ? "Pause Investment" : 
               actionType === "completed" ? "Complete Investment" :
               actionType === "cancelled" ? "Cancel Investment" : "Resume Investment"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "active" ? "Are you sure you want to activate this investment?" :
               actionType === "paused" ? "Are you sure you want to pause this investment?" :
               actionType === "completed" ? "Are you sure you want to mark this investment as completed?" :
               actionType === "cancelled" ? "Are you sure you want to cancel this investment?" :
               "Are you sure you want to resume this investment?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
              <Textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add any additional notes..."
                rows={3}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedInvestment && handleInvestmentAction(selectedInvestment._id, actionType)}
              className={actionType === "cancelled" ? "bg-red-600 hover:bg-red-700" : 
                        actionType === "completed" ? "bg-blue-600 hover:bg-blue-700" : 
                        "bg-green-600 hover:bg-green-700"}
            >
              {actionType === "active" ? "Activate" : 
               actionType === "paused" ? "Pause" :
               actionType === "completed" ? "Complete" :
               actionType === "cancelled" ? "Cancel" : "Resume"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
