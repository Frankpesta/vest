"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Wallet, 
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
  ArrowUpRight,
  RefreshCw,
  FileText,
  Activity,
  User
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

export default function AdminWithdrawalsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedWithdrawals, setSelectedWithdrawals] = useState<string[]>([])
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null)
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [isBulkActionModalOpen, setIsBulkActionModalOpen] = useState(false)
  const [actionType, setActionType] = useState<string>("")
  const [adminNotes, setAdminNotes] = useState("")
  const [bulkAction, setBulkAction] = useState<string>("")

  // Fetch data from backend
  const withdrawals = useQuery(api.withdrawalRequests.getAllWithdrawalRequests, { limit: 100 })
  
  // Mutations
  const approveWithdrawal = useMutation(api.withdrawalRequests.approveWithdrawalRequest)
  const rejectWithdrawal = useMutation(api.withdrawalRequests.rejectWithdrawalRequest)
  const markProcessing = useMutation(api.withdrawalRequests.markWithdrawalProcessing)
  const markCompleted = useMutation(api.withdrawalRequests.markWithdrawalCompleted)

  const statuses = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "processing", label: "Processing" },
    { value: "completed", label: "Completed" },
    { value: "rejected", label: "Rejected" },
  ]

  const sortOptions = [
    { value: "createdAt", label: "Date" },
    { value: "amount", label: "Amount" },
    { value: "status", label: "Status" },
    { value: "balanceType", label: "Balance Type" },
  ]

  const bulkActions = [
    { value: "approve", label: "Approve Withdrawals", icon: CheckCircle },
    { value: "reject", label: "Reject Withdrawals", icon: X },
    { value: "processing", label: "Mark as Processing", icon: RefreshCw },
  ]

  const filteredAndSortedWithdrawals = withdrawals?.filter((withdrawal) => {
    const matchesSearch = withdrawal.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         withdrawal.walletAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         withdrawal.transactionHash?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || withdrawal.status === selectedStatus
    return matchesSearch && matchesStatus
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

  const handleSelectWithdrawal = (withdrawalId: string) => {
    setSelectedWithdrawals(prev => 
      prev.includes(withdrawalId) 
        ? prev.filter(id => id !== withdrawalId)
        : [...prev, withdrawalId]
    )
  }

  const handleSelectAll = () => {
    if (selectedWithdrawals.length === filteredAndSortedWithdrawals.length) {
      setSelectedWithdrawals([])
    } else {
      setSelectedWithdrawals(filteredAndSortedWithdrawals.map(withdrawal => withdrawal._id))
    }
  }

  const handleWithdrawalAction = async (withdrawalId: string, action: string) => {
    try {
      switch (action) {
        case "approve":
          await approveWithdrawal({ withdrawalId: withdrawalId as any })
          break
        case "reject":
          await rejectWithdrawal({ 
            withdrawalId: withdrawalId as any,
            reason: adminNotes || "No reason provided"
          })
          break
        case "processing":
          await markProcessing({ withdrawalId: withdrawalId as any })
          break
        case "completed":
          await markCompleted({ withdrawalId: withdrawalId as any })
          break
      }
      
      toast.success(`Withdrawal ${action} successfully`)
      setIsActionModalOpen(false)
      setAdminNotes("")
    } catch (error) {
      toast.error(`Failed to ${action} withdrawal`)
      console.error(error)
    }
  }

  const handleBulkAction = async () => {
    if (selectedWithdrawals.length === 0) {
      toast.error("Please select withdrawals first")
      return
    }

    try {
      for (const withdrawalId of selectedWithdrawals) {
        switch (bulkAction) {
          case "approve":
            await approveWithdrawal({ withdrawalId: withdrawalId as any })
            break
          case "reject":
            await rejectWithdrawal({ 
              withdrawalId: withdrawalId as any,
              reason: adminNotes || "No reason provided"
            })
            break
          case "processing":
            await markProcessing({ withdrawalId: withdrawalId as any })
            break
        }
      }
      
      toast.success(`Bulk action completed for ${selectedWithdrawals.length} withdrawals`)
      setSelectedWithdrawals([])
      setIsBulkActionModalOpen(false)
      setAdminNotes("")
    } catch (error) {
      toast.error("Failed to perform bulk action")
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
      case "approved":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          <CheckCircle className="mr-1 h-3 w-3" />
          Approved
        </Badge>
      case "processing":
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          <RefreshCw className="mr-1 h-3 w-3" />
          Processing
        </Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle className="mr-1 h-3 w-3" />
          Completed
        </Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          <X className="mr-1 h-3 w-3" />
          Rejected
        </Badge>
      default:
        return null
    }
  }

  const getBalanceTypeLabel = (type: string) => {
    const types = {
      main: "Main Balance",
      interest: "Interest Balance",
      investment: "Investment Balance",
    }
    return types[type as keyof typeof types] || type
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

  // Calculate statistics
  const stats = {
    total: withdrawals?.length || 0,
    pending: withdrawals?.filter(w => w.status === "pending").length || 0,
    approved: withdrawals?.filter(w => w.status === "approved").length || 0,
    processing: withdrawals?.filter(w => w.status === "processing").length || 0,
    completed: withdrawals?.filter(w => w.status === "completed").length || 0,
    rejected: withdrawals?.filter(w => w.status === "rejected").length || 0,
    totalAmount: withdrawals?.reduce((sum, w) => sum + (w.amount || 0), 0) || 0,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Withdrawal Management</h1>
          <p className="text-slate-600 dark:text-slate-300">Review and process user withdrawal requests</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Pending</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Approved</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.approved}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Processing</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.processing}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Completed</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.completed}</p>
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
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Amount</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.totalAmount)}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-slate-800">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search and Sort */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search by user ID, wallet address, or transaction hash..."
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

            {/* Bulk Actions */}
            {selectedWithdrawals.length > 0 && (
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    {selectedWithdrawals.length} withdrawal{selectedWithdrawals.length !== 1 ? 's' : ''} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedWithdrawals([])}
                  >
                    Clear
                  </Button>
                </div>
                <Button
                  onClick={() => setIsBulkActionModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Bulk Actions
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Withdrawals Table */}
      <Card className="bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wallet className="mr-2 h-5 w-5" />
            Withdrawal Requests ({filteredAndSortedWithdrawals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawals === undefined ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredAndSortedWithdrawals.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="No withdrawal requests found"
              description={searchTerm || selectedStatus !== "all"
                ? "Try adjusting your search or filter criteria."
                : "No withdrawal requests have been made yet."
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedWithdrawals.length === filteredAndSortedWithdrawals.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Balance Type</TableHead>
                    <TableHead>Wallet Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedWithdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedWithdrawals.includes(withdrawal._id)}
                          onCheckedChange={() => handleSelectWithdrawal(withdrawal._id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {withdrawal.userId.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {withdrawal.userId.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{formatCurrency(withdrawal.amount || 0)}</p>
                          {withdrawal.currency && (
                            <p className="text-slate-500">{withdrawal.currency}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{getBalanceTypeLabel(withdrawal.balanceType)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-mono">
                          {withdrawal.walletAddress ? (
                            <span className="text-slate-600 dark:text-slate-300">
                              {withdrawal.walletAddress.slice(0, 8)}...{withdrawal.walletAddress.slice(-8)}
                            </span>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(withdrawal.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatDate(withdrawal.createdAt)}</p>
                          <p className="text-slate-500">{formatRelativeTime(withdrawal.createdAt)}</p>
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
                              setSelectedWithdrawal(withdrawal)
                              setIsWithdrawalModalOpen(true)
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {withdrawal.status === "pending" && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedWithdrawal(withdrawal)
                                    setActionType("approve")
                                    setIsActionModalOpen(true)
                                  }}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedWithdrawal(withdrawal)
                                    setActionType("reject")
                                    setIsActionModalOpen(true)
                                  }}
                                  className="text-red-600"
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            {withdrawal.status === "approved" && (
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedWithdrawal(withdrawal)
                                  setActionType("processing")
                                  setIsActionModalOpen(true)
                                }}
                                className="text-purple-600"
                              >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Mark Processing
                              </DropdownMenuItem>
                            )}
                            {withdrawal.status === "processing" && (
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedWithdrawal(withdrawal)
                                  setActionType("completed")
                                  setIsActionModalOpen(true)
                                }}
                                className="text-green-600"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark Completed
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

      {/* Withdrawal Details Modal */}
      <Dialog open={isWithdrawalModalOpen} onOpenChange={setIsWithdrawalModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Withdrawal Details</DialogTitle>
            <DialogDescription>
              Complete information about the selected withdrawal request
            </DialogDescription>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Withdrawal ID</Label>
                  <p className="text-sm font-mono">{selectedWithdrawal._id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedWithdrawal.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Amount</Label>
                  <p className="text-sm font-medium">{formatCurrency(selectedWithdrawal.amount || 0)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Balance Type</Label>
                  <p className="text-sm">{getBalanceTypeLabel(selectedWithdrawal.balanceType)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">User ID</Label>
                  <p className="text-sm font-mono">{selectedWithdrawal.userId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Requested</Label>
                  <p className="text-sm">{formatDate(selectedWithdrawal.createdAt)}</p>
                </div>
              </div>

              {selectedWithdrawal.walletAddress && (
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Wallet Address</Label>
                  <p className="text-sm font-mono break-all">{selectedWithdrawal.walletAddress}</p>
                </div>
              )}

              {selectedWithdrawal.transactionHash && (
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Transaction Hash</Label>
                  <p className="text-sm font-mono break-all">{selectedWithdrawal.transactionHash}</p>
                </div>
              )}

              {selectedWithdrawal.reason && (
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Reason</Label>
                  <p className="text-sm p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    {selectedWithdrawal.reason}
                  </p>
                </div>
              )}

              {selectedWithdrawal.adminNotes && (
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Admin Notes</Label>
                  <p className="text-sm p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    {selectedWithdrawal.adminNotes}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWithdrawalModalOpen(false)}>
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
              {actionType === "approve" ? "Approve Withdrawal" : 
               actionType === "reject" ? "Reject Withdrawal" : 
               actionType === "processing" ? "Mark as Processing" :
               "Mark as Completed"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "approve" ? "Are you sure you want to approve this withdrawal request?" :
               actionType === "reject" ? "Are you sure you want to reject this withdrawal request?" :
               actionType === "processing" ? "Are you sure you want to mark this withdrawal as processing?" :
               "Are you sure you want to mark this withdrawal as completed?"}
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
              onClick={() => selectedWithdrawal && handleWithdrawalAction(selectedWithdrawal._id, actionType)}
              className={actionType === "approve" || actionType === "completed" ? "bg-green-600 hover:bg-green-700" : 
                        actionType === "reject" ? "bg-red-600 hover:bg-red-700" : 
                        "bg-purple-600 hover:bg-purple-700"}
            >
              {actionType === "approve" ? "Approve" : 
               actionType === "reject" ? "Reject" : 
               actionType === "processing" ? "Mark Processing" :
               "Mark Completed"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Action Modal */}
      <AlertDialog open={isBulkActionModalOpen} onOpenChange={setIsBulkActionModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bulk Action</AlertDialogTitle>
            <AlertDialogDescription>
              Select an action to perform on {selectedWithdrawals.length} selected withdrawals.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 block">Action</Label>
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an action" />
                </SelectTrigger>
                <SelectContent>
                  {bulkActions.map((action) => (
                    <SelectItem key={action.value} value={action.value}>
                      <div className="flex items-center">
                        <action.icon className="mr-2 h-4 w-4" />
                        {action.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bulkAdminNotes">Admin Notes (Optional)</Label>
              <Textarea
                id="bulkAdminNotes"
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
              onClick={handleBulkAction}
              disabled={!bulkAction}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Execute Action
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
