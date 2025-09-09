"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  CreditCard, 
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
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  FileText,
  Activity
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

export default function AdminTransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [isBulkActionModalOpen, setIsBulkActionModalOpen] = useState(false)
  const [actionType, setActionType] = useState<string>("")
  const [adminNotes, setAdminNotes] = useState("")
  const [bulkAction, setBulkAction] = useState<string>("")

  // Fetch data from backend
  const transactions = useQuery(api.transactions.getAllTransactions, { limit: 100 })
  const transactionStats = useQuery(api.transactions.getTransactionStats, {})
  
  // Mutations
  const updateTransactionStatus = useMutation(api.transactions.updateTransactionStatus)
  const bulkUpdateTransactionStatus = useMutation(api.transactions.bulkUpdateTransactionStatus)

  const types = [
    { value: "all", label: "All Types" },
    { value: "deposit", label: "Deposits" },
    { value: "withdrawal", label: "Withdrawals" },
    { value: "investment", label: "Investments" },
    { value: "return", label: "Returns" },
    { value: "fee", label: "Fees" },
    { value: "refund", label: "Refunds" },
  ]

  const statuses = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "failed", label: "Failed" },
    { value: "cancelled", label: "Cancelled" },
  ]

  const sortOptions = [
    { value: "createdAt", label: "Date" },
    { value: "amount", label: "Amount" },
    { value: "type", label: "Type" },
    { value: "status", label: "Status" },
  ]

  const bulkActions = [
    { value: "confirmed", label: "Confirm Transactions", icon: CheckCircle },
    { value: "failed", label: "Mark as Failed", icon: X },
    { value: "cancelled", label: "Cancel Transactions", icon: X },
  ]

  const filteredAndSortedTransactions = transactions?.filter((transaction) => {
    const matchesSearch = transaction.transactionHash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.fromAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.toAddress?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || transaction.type === selectedType
    const matchesStatus = selectedStatus === "all" || transaction.status === selectedStatus
    return matchesSearch && matchesType && matchesStatus
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

  const handleSelectTransaction = (transactionId: string) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId) 
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    )
  }

  const handleSelectAll = () => {
    if (selectedTransactions.length === filteredAndSortedTransactions.length) {
      setSelectedTransactions([])
    } else {
      setSelectedTransactions(filteredAndSortedTransactions.map(transaction => transaction._id))
    }
  }

  const handleTransactionAction = async (transactionId: string, action: string) => {
    try {
      await updateTransactionStatus({
        transactionId: transactionId as any,
        status: action as any,
        adminNotes: adminNotes || undefined,
      })
      
      toast.success(`Transaction ${action} successfully`)
      setIsActionModalOpen(false)
      setAdminNotes("")
    } catch (error) {
      toast.error(`Failed to ${action} transaction`)
      console.error(error)
    }
  }

  const handleBulkAction = async () => {
    if (selectedTransactions.length === 0) {
      toast.error("Please select transactions first")
      return
    }

    try {
      await bulkUpdateTransactionStatus({
        transactionIds: selectedTransactions as any,
        status: bulkAction as any,
        adminNotes: adminNotes || undefined,
      })
      toast.success(`Bulk action completed for ${selectedTransactions.length} transactions`)
      setSelectedTransactions([])
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
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle className="mr-1 h-3 w-3" />
          Confirmed
        </Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          <X className="mr-1 h-3 w-3" />
          Failed
        </Badge>
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
          <X className="mr-1 h-3 w-3" />
          Cancelled
        </Badge>
      default:
        return null
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />
      case "withdrawal":
        return <ArrowUpRight className="h-4 w-4 text-red-600" />
      case "investment":
        return <TrendingUp className="h-4 w-4 text-blue-600" />
      case "return":
        return <RefreshCw className="h-4 w-4 text-purple-600" />
      case "fee":
        return <DollarSign className="h-4 w-4 text-orange-600" />
      case "refund":
        return <RefreshCw className="h-4 w-4 text-cyan-600" />
      default:
        return <CreditCard className="h-4 w-4 text-slate-600" />
    }
  }

  const getTypeLabel = (type: string) => {
    const types = {
      deposit: "Deposit",
      withdrawal: "Withdrawal",
      investment: "Investment",
      return: "Return",
      fee: "Fee",
      refund: "Refund",
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Transaction Management</h1>
          <p className="text-slate-600 dark:text-slate-300">Monitor and manage all platform transactions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {transactionStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Transactions</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{transactionStats.total}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Pending</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{transactionStats.pending}</p>
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
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Confirmed</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{transactionStats.confirmed}</p>
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
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Volume</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(transactionStats.totalVolume)}</p>
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
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Recent (7d)</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{transactionStats.recentTransactions}</p>
                </div>
                <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
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
            {/* Search and Sort */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search by hash, user ID, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex space-x-2">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            {selectedTransactions.length > 0 && (
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    {selectedTransactions.length} transaction{selectedTransactions.length !== 1 ? 's' : ''} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTransactions([])}
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

      {/* Transactions Table */}
      <Card className="bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Transactions ({filteredAndSortedTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions === undefined ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredAndSortedTransactions.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No transactions found"
              description={searchTerm || selectedType !== "all" || selectedStatus !== "all"
                ? "Try adjusting your search or filter criteria."
                : "No transactions have been recorded yet."
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedTransactions.length === filteredAndSortedTransactions.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hash</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedTransactions.map((transaction) => (
                    <TableRow key={transaction._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedTransactions.includes(transaction._id)}
                          onCheckedChange={() => handleSelectTransaction(transaction._id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(transaction.type)}
                          <span className="font-medium">{getTypeLabel(transaction.type)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {transaction.userId.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {transaction.userId.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{formatCurrency(transaction.amount || 0)}</p>
                          {transaction.currency && (
                            <p className="text-slate-500">{transaction.cryptoAmount} {transaction.currency}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-mono">
                          {transaction.transactionHash ? (
                            <span className="text-slate-600 dark:text-slate-300">
                              {transaction.transactionHash.slice(0, 8)}...{transaction.transactionHash.slice(-8)}
                            </span>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatDate(transaction.createdAt)}</p>
                          <p className="text-slate-500">{formatRelativeTime(transaction.createdAt)}</p>
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
                              setSelectedTransaction(transaction)
                              setIsTransactionModalOpen(true)
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {transaction.status === "pending" && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedTransaction(transaction)
                                    setActionType("confirmed")
                                    setIsActionModalOpen(true)
                                  }}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Confirm
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedTransaction(transaction)
                                    setActionType("failed")
                                    setIsActionModalOpen(true)
                                  }}
                                  className="text-red-600"
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Mark Failed
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedTransaction(transaction)
                                    setActionType("cancelled")
                                    setIsActionModalOpen(true)
                                  }}
                                  className="text-gray-600"
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Cancel
                                </DropdownMenuItem>
                              </>
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

      {/* Transaction Details Modal */}
      <Dialog open={isTransactionModalOpen} onOpenChange={setIsTransactionModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Complete information about the selected transaction
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Transaction ID</Label>
                  <p className="text-sm font-mono">{selectedTransaction._id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Type</Label>
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(selectedTransaction.type)}
                    <span className="text-sm">{getTypeLabel(selectedTransaction.type)}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Amount</Label>
                  <p className="text-sm font-medium">{formatCurrency(selectedTransaction.amount || 0)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">User ID</Label>
                  <p className="text-sm font-mono">{selectedTransaction.userId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Created</Label>
                  <p className="text-sm">{formatDate(selectedTransaction.createdAt)}</p>
                </div>
              </div>

              {selectedTransaction.transactionHash && (
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Transaction Hash</Label>
                  <p className="text-sm font-mono break-all">{selectedTransaction.transactionHash}</p>
                </div>
              )}

              {selectedTransaction.fromAddress && (
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">From Address</Label>
                  <p className="text-sm font-mono break-all">{selectedTransaction.fromAddress}</p>
                </div>
              )}

              {selectedTransaction.toAddress && (
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">To Address</Label>
                  <p className="text-sm font-mono break-all">{selectedTransaction.toAddress}</p>
                </div>
              )}

              {selectedTransaction.adminNotes && (
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Admin Notes</Label>
                  <p className="text-sm p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    {selectedTransaction.adminNotes}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTransactionModalOpen(false)}>
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
              {actionType === "confirmed" ? "Confirm Transaction" : 
               actionType === "failed" ? "Mark as Failed" : 
               "Cancel Transaction"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "confirmed" ? "Are you sure you want to confirm this transaction?" :
               actionType === "failed" ? "Are you sure you want to mark this transaction as failed?" :
               "Are you sure you want to cancel this transaction?"}
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
              onClick={() => selectedTransaction && handleTransactionAction(selectedTransaction._id, actionType)}
              className={actionType === "confirmed" ? "bg-green-600 hover:bg-green-700" : 
                        actionType === "failed" ? "bg-red-600 hover:bg-red-700" : 
                        "bg-gray-600 hover:bg-gray-700"}
            >
              {actionType === "confirmed" ? "Confirm" : 
               actionType === "failed" ? "Mark Failed" : 
               "Cancel"}
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
              Select an action to perform on {selectedTransactions.length} selected transactions.
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
