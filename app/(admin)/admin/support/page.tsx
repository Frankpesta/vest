"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  HelpCircle, 
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
  MessageSquare,
  User,
  Calendar,
  FileText,
  Activity,
  ArrowRight,
  Reply
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

export default function AdminSupportPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedPriority, setSelectedPriority] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [actionType, setActionType] = useState<string>("")
  const [replyMessage, setReplyMessage] = useState("")
  const [adminNotes, setAdminNotes] = useState("")

  // Fetch data from backend
  const supportTickets = useQuery(api.supportTickets.getAllSupportTickets, { limit: 100 })
  const supportStats = useQuery(api.supportTickets.getSupportTicketStats, {})
  
  // Mutations
  const updateTicketStatus = useMutation(api.supportTickets.updateSupportTicketStatus)
  const assignTicket = useMutation(api.supportTickets.assignSupportTicket)
  const addAdminResponse = useMutation(api.supportTickets.addAdminResponse)

  const statuses = [
    { value: "all", label: "All Status" },
    { value: "open", label: "Open" },
    { value: "in_progress", label: "In Progress" },
    { value: "waiting_for_user", label: "Waiting for User" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
  ]

  const priorities = [
    { value: "all", label: "All Priorities" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ]

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "investment", label: "Investment" },
    { value: "transaction", label: "Transaction" },
    { value: "account", label: "Account" },
    { value: "technical", label: "Technical" },
    { value: "billing", label: "Billing" },
    { value: "other", label: "Other" },
  ]

  const sortOptions = [
    { value: "createdAt", label: "Date" },
    { value: "priority", label: "Priority" },
    { value: "status", label: "Status" },
    { value: "category", label: "Category" },
  ]

  const filteredAndSortedTickets = supportTickets?.filter((ticket) => {
    const matchesSearch = ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.userId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || ticket.status === selectedStatus
    const matchesPriority = selectedPriority === "all" || ticket.priority === selectedPriority
    const matchesCategory = selectedCategory === "all" || ticket.category === selectedCategory
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
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

  const handleSelectTicket = (ticketId: string) => {
    setSelectedTickets(prev => 
      prev.includes(ticketId) 
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    )
  }

  const handleSelectAll = () => {
    if (selectedTickets.length === filteredAndSortedTickets.length) {
      setSelectedTickets([])
    } else {
      setSelectedTickets(filteredAndSortedTickets.map(ticket => ticket._id))
    }
  }

  const handleTicketAction = async (ticketId: string, action: string) => {
    try {
      switch (action) {
        case "in_progress":
          await updateTicketStatus({ 
            ticketId: ticketId as any, 
            status: "in_progress" 
          })
          break
        case "waiting_for_user":
          await updateTicketStatus({ 
            ticketId: ticketId as any, 
            status: "waiting_for_user" 
          })
          break
        case "resolved":
          await updateTicketStatus({ 
            ticketId: ticketId as any, 
            status: "resolved" 
          })
          break
        case "closed":
          await updateTicketStatus({ 
            ticketId: ticketId as any, 
            status: "closed" 
          })
          break
      }
      
      toast.success(`Ticket ${action.replace('_', ' ')} successfully`)
      setIsActionModalOpen(false)
    } catch (error) {
      toast.error(`Failed to ${action} ticket`)
      console.error(error)
    }
  }

  const handleReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) {
      toast.error("Please enter a reply message")
      return
    }

    try {
      await addAdminResponse({
        ticketId: selectedTicket._id as any,
        message: replyMessage,
      })
      
      toast.success("Reply sent successfully")
      setIsReplyModalOpen(false)
      setReplyMessage("")
    } catch (error) {
      toast.error("Failed to send reply")
      console.error(error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          <HelpCircle className="mr-1 h-3 w-3" />
          Open
        </Badge>
      case "in_progress":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <Clock className="mr-1 h-3 w-3" />
          In Progress
        </Badge>
      case "waiting_for_user":
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
          <User className="mr-1 h-3 w-3" />
          Waiting for User
        </Badge>
      case "resolved":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle className="mr-1 h-3 w-3" />
          Resolved
        </Badge>
      case "closed":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
          <X className="mr-1 h-3 w-3" />
          Closed
        </Badge>
      default:
        return null
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return <Badge variant="outline" className="text-green-600 border-green-200">
          Low
        </Badge>
      case "medium":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200">
          Medium
        </Badge>
      case "high":
        return <Badge variant="outline" className="text-orange-600 border-orange-200">
          High
        </Badge>
      case "urgent":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Urgent
        </Badge>
      default:
        return null
    }
  }

  const getCategoryLabel = (category: string) => {
    const categories = {
      investment: "Investment",
      transaction: "Transaction",
      account: "Account",
      technical: "Technical",
      billing: "Billing",
      other: "Other",
    }
    return categories[category as keyof typeof categories] || category
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

  // Calculate statistics
  const stats = {
    total: supportTickets?.length || 0,
    open: supportTickets?.filter(t => t.status === "open").length || 0,
    inProgress: supportTickets?.filter(t => t.status === "in_progress").length || 0,
    waiting: supportTickets?.filter(t => t.status === "waiting_for_user").length || 0,
    resolved: supportTickets?.filter(t => t.status === "resolved").length || 0,
    closed: supportTickets?.filter(t => t.status === "closed").length || 0,
    urgent: supportTickets?.filter(t => t.priority === "urgent").length || 0,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Support Management</h1>
          <p className="text-slate-600 dark:text-slate-300">Manage customer support tickets and inquiries</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Tickets</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Open</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.open}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">In Progress</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.inProgress}</p>
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
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Urgent</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.urgent}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
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
                  placeholder="Search by ticket number, subject, or user ID..."
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
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
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

      {/* Support Tickets Table */}
      <Card className="bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center">
            <HelpCircle className="mr-2 h-5 w-5" />
            Support Tickets ({filteredAndSortedTickets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {supportTickets === undefined ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredAndSortedTickets.length === 0 ? (
            <EmptyState
              icon={HelpCircle}
              title="No support tickets found"
              description={searchTerm || selectedStatus !== "all" || selectedPriority !== "all" || selectedCategory !== "all"
                ? "Try adjusting your search or filter criteria."
                : "No support tickets have been created yet."
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedTickets.length === filteredAndSortedTickets.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Ticket</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedTickets.map((ticket) => (
                    <TableRow key={ticket._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedTickets.includes(ticket._id)}
                          onCheckedChange={() => handleSelectTicket(ticket._id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-mono">
                          <p className="font-medium">{ticket.ticketNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {ticket.userId.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {ticket.userId.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm max-w-xs">
                          <p className="font-medium truncate">{ticket.subject}</p>
                          <p className="text-slate-500 truncate">{ticket.description.slice(0, 50)}...</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{getCategoryLabel(ticket.category)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(ticket.priority)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(ticket.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatDate(ticket.createdAt)}</p>
                          <p className="text-slate-500">{formatRelativeTime(ticket.createdAt)}</p>
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
                              setSelectedTicket(ticket)
                              setIsTicketModalOpen(true)
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedTicket(ticket)
                              setIsReplyModalOpen(true)
                            }}>
                              <Reply className="mr-2 h-4 w-4" />
                              Reply
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {ticket.status === "open" && (
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedTicket(ticket)
                                  setActionType("in_progress")
                                  setIsActionModalOpen(true)
                                }}
                                className="text-yellow-600"
                              >
                                <Clock className="mr-2 h-4 w-4" />
                                Mark In Progress
                              </DropdownMenuItem>
                            )}
                            {ticket.status === "in_progress" && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedTicket(ticket)
                                    setActionType("waiting_for_user")
                                    setIsActionModalOpen(true)
                                  }}
                                  className="text-orange-600"
                                >
                                  <User className="mr-2 h-4 w-4" />
                                  Waiting for User
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedTicket(ticket)
                                    setActionType("resolved")
                                    setIsActionModalOpen(true)
                                  }}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Mark Resolved
                                </DropdownMenuItem>
                              </>
                            )}
                            {ticket.status === "resolved" && (
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedTicket(ticket)
                                  setActionType("closed")
                                  setIsActionModalOpen(true)
                                }}
                                className="text-gray-600"
                              >
                                <X className="mr-2 h-4 w-4" />
                                Close Ticket
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

      {/* Ticket Details Modal */}
      <Dialog open={isTicketModalOpen} onOpenChange={setIsTicketModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
            <DialogDescription>
              Complete information about the selected support ticket
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Ticket Number</Label>
                  <p className="text-sm font-mono">{selectedTicket.ticketNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedTicket.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Priority</Label>
                  <div className="mt-1">{getPriorityBadge(selectedTicket.priority)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Category</Label>
                  <p className="text-sm">{getCategoryLabel(selectedTicket.category)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">User ID</Label>
                  <p className="text-sm font-mono">{selectedTicket.userId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Created</Label>
                  <p className="text-sm">{formatDate(selectedTicket.createdAt)}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Subject</Label>
                <p className="text-sm font-medium mt-1">{selectedTicket.subject}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Description</Label>
                <p className="text-sm mt-1 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  {selectedTicket.description}
                </p>
              </div>

              {selectedTicket.assignedTo && (
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Assigned To</Label>
                  <p className="text-sm">{selectedTicket.assignedTo}</p>
                </div>
              )}

              {selectedTicket.lastResponseAt && (
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Last Response</Label>
                  <p className="text-sm">{formatDate(selectedTicket.lastResponseAt)}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTicketModalOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsTicketModalOpen(false)
              setIsReplyModalOpen(true)
            }}>
              <Reply className="mr-2 h-4 w-4" />
              Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply Modal */}
      <Dialog open={isReplyModalOpen} onOpenChange={setIsReplyModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to Ticket</DialogTitle>
            <DialogDescription>
              Send a response to the user for ticket {selectedTicket?.ticketNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="replyMessage">Message</Label>
              <Textarea
                id="replyMessage"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your response here..."
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReplyModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReply} disabled={!replyMessage.trim()}>
              <Reply className="mr-2 h-4 w-4" />
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Modal */}
      <AlertDialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "in_progress" ? "Mark as In Progress" : 
               actionType === "waiting_for_user" ? "Mark as Waiting for User" : 
               actionType === "resolved" ? "Mark as Resolved" :
               "Close Ticket"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "in_progress" ? "Are you sure you want to mark this ticket as in progress?" :
               actionType === "waiting_for_user" ? "Are you sure you want to mark this ticket as waiting for user?" :
               actionType === "resolved" ? "Are you sure you want to mark this ticket as resolved?" :
               "Are you sure you want to close this ticket?"}
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
              onClick={() => selectedTicket && handleTicketAction(selectedTicket._id, actionType)}
              className={actionType === "resolved" ? "bg-green-600 hover:bg-green-700" : 
                        actionType === "closed" ? "bg-gray-600 hover:bg-gray-700" : 
                        "bg-blue-600 hover:bg-blue-700"}
            >
              {actionType === "in_progress" ? "Mark In Progress" : 
               actionType === "waiting_for_user" ? "Mark Waiting" :
               actionType === "resolved" ? "Mark Resolved" :
               "Close Ticket"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
