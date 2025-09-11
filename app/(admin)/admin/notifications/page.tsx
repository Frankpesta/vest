"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Bell, 
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
  Send,
  Trash2,
  User,
  Calendar,
  Mail,
  MessageSquare,
  Settings,
  Shield,
  DollarSign,
  TrendingUp,
  Wallet
} from "lucide-react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { toast } from "sonner"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { useAuthStore } from "@/lib/store"
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
import { formatDate } from "date-fns"
import { types } from "util"

export default function AdminNotificationsPage() {
  const { user } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedPriority, setSelectedPriority] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [selectedNotification, setSelectedNotification] = useState<any>(null)
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "general",
    priority: "normal",
    userId: "",
  })

  // Fetch data from backend
  const notifications = useQuery(api.notifications.getAllNotifications, { limit: 100 })
  const notificationStats = useQuery(api.notifications.getNotificationStats, {})
  
  // Mutations
  const markAsRead = useMutation(api.notifications.markAsRead)
  const markAllAsRead = useMutation(api.notifications.markAllAsRead)
  const deleteNotification = useMutation(api.notifications.deleteNotification)
  const createNotification = useMutation(api.notifications.createNotification)

  const types = [
    { value: "all", label: "All Types" },
    { value: "general", label: "General" },
    { value: "transaction", label: "Transaction" },
    { value: "investment", label: "Investment" },
    { value: "withdrawal", label: "Withdrawal" },
    { value: "kyc", label: "KYC" },
    { value: "security", label: "Security" },
    { value: "system", label: "System" },
  ]

  const priorities = [
    { value: "all", label: "All Priorities" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ]

  const statuses = [
    { value: "all", label: "All Status" },
    { value: "unread", label: "Unread" },
    { value: "read", label: "Read" },
  ]

  const sortOptions = [
    { value: "createdAt", label: "Date" },
    { value: "priority", label: "Priority" },
    { value: "type", label: "Type" },
    { value: "title", label: "Title" },
  ]

  const filteredAndSortedNotifications = notifications?.filter((notification) => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.userId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || notification.type === selectedType
    const matchesPriority = selectedPriority === "all" || notification.priority === selectedPriority
    const matchesStatus = selectedStatus === "all" || 
                         (selectedStatus === "read" ? notification.isRead : !notification.isRead)
    return matchesSearch && matchesType && matchesPriority && matchesStatus
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

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    )
  }

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredAndSortedNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(filteredAndSortedNotifications.map(notification => notification._id))
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead({ notificationId: notificationId as any })
      toast.success("Notification marked as read")
    } catch (error) {
      toast.error("Failed to mark notification as read")
      console.error(error)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user?.id) {
      toast.error("User not authenticated")
      return
    }
    try {
      await markAllAsRead({ userId: user.id })
      toast.success("All notifications marked as read")
    } catch (error) {
      toast.error("Failed to mark all notifications as read")
      console.error(error)
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification({ notificationId: notificationId as any })
      toast.success("Notification deleted")
      setIsDeleteModalOpen(false)
    } catch (error) {
      toast.error("Failed to delete notification")
      console.error(error)
    }
  }

  const handleCreateNotification = async () => {
    if (!newNotification.title || !newNotification.message) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      await createNotification({
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type as any,
        priority: newNotification.priority as any,
        userId: newNotification.userId || "system",
      })
      
      toast.success("Notification created successfully")
      setIsCreateModalOpen(false)
      setNewNotification({
        title: "",
        message: "",
        type: "general",
        priority: "normal",
        userId: "",
      })
    } catch (error) {
      toast.error("Failed to create notification")
      console.error(error)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "transaction":
        return <DollarSign className="h-4 w-4" />
      case "investment":
        return <TrendingUp className="h-4 w-4" />
      case "withdrawal":
        return <Wallet className="h-4 w-4" />
      case "kyc":
        return <Shield className="h-4 w-4" />
      case "security":
        return <Shield className="h-4 w-4" />
      case "system":
        return <Settings className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
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
    total: notifications?.length || 0,
    unread: notifications?.filter(n => !n.isRead).length || 0,
    read: notifications?.filter(n => n.isRead).length || 0,
    urgent: notifications?.filter(n => n.priority === "urgent").length || 0,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Notification Management</h1>
          <p className="text-slate-600 dark:text-slate-300">Manage system notifications and user communications</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={handleMarkAllAsRead}
            variant="outline" 
            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark All Read
          </Button>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="mr-2 h-4 w-4" />
            Create Notification
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Notifications</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Unread</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.unread}</p>
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
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Read</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.read}</p>
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
                  placeholder="Search by title, message, or user ID..."
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
          </div>
        </CardContent>
      </Card>

      {/* Notifications Table */}
      <Card className="bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Notifications ({filteredAndSortedNotifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications === undefined ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredAndSortedNotifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No notifications found"
              description={searchTerm || selectedType !== "all" || selectedPriority !== "all" || selectedStatus !== "all"
                ? "Try adjusting your search or filter criteria."
                : "No notifications have been created yet."
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedNotifications.length === filteredAndSortedNotifications.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedNotifications.map((notification) => (
                    <TableRow 
                      key={notification._id} 
                      className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedNotifications.includes(notification._id)}
                          onCheckedChange={() => handleSelectNotification(notification._id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(notification.type)}
                          <span className="text-sm font-medium capitalize">{notification.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm max-w-xs">
                          <p className="font-medium truncate">{notification.title}</p>
                          <p className="text-slate-500 truncate">{notification.message.slice(0, 50)}...</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-mono">{notification.userId.slice(0, 8)}...</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(notification.priority)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={notification.isRead ? "outline" : "default"}>
                          {notification.isRead ? "Read" : "Unread"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatDate(notification.createdAt)}</p>
                          <p className="text-slate-500">{formatRelativeTime(notification.createdAt)}</p>
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
                              setSelectedNotification(notification)
                              setIsNotificationModalOpen(true)
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {!notification.isRead && (
                              <DropdownMenuItem onClick={() => handleMarkAsRead(notification._id)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Read
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedNotification(notification)
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

      {/* Notification Details Modal */}
      <Dialog open={isNotificationModalOpen} onOpenChange={setIsNotificationModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
            <DialogDescription>
              Complete information about the selected notification
            </DialogDescription>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Type</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getTypeIcon(selectedNotification.type)}
                    <span className="text-sm font-medium capitalize">{selectedNotification.type}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Priority</Label>
                  <div className="mt-1">{getPriorityBadge(selectedNotification.priority)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">User ID</Label>
                  <p className="text-sm font-mono">{selectedNotification.userId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Status</Label>
                  <div className="mt-1">
                    <Badge variant={selectedNotification.isRead ? "outline" : "default"}>
                      {selectedNotification.isRead ? "Read" : "Unread"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Created</Label>
                  <p className="text-sm">{formatDate(selectedNotification.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Read At</Label>
                  <p className="text-sm">{selectedNotification.readAt ? formatDate(selectedNotification.readAt) : "Not read"}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Title</Label>
                <p className="text-sm font-medium mt-1">{selectedNotification.title}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Message</Label>
                <p className="text-sm mt-1 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  {selectedNotification.message}
                </p>
              </div>

              {selectedNotification.metadata && (
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Metadata</Label>
                  <pre className="text-xs p-3 bg-slate-50 dark:bg-slate-700 rounded-lg overflow-auto">
                    {JSON.stringify(selectedNotification.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotificationModalOpen(false)}>
              Close
            </Button>
            {selectedNotification && !selectedNotification.isRead && (
              <Button onClick={() => {
                handleMarkAsRead(selectedNotification._id)
                setIsNotificationModalOpen(false)
              }}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Read
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Notification Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Notification</DialogTitle>
            <DialogDescription>
              Send a notification to users
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={newNotification.title}
                onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Notification title"
              />
            </div>
            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={newNotification.message}
                onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Notification message"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={newNotification.type} onValueChange={(value) => setNewNotification(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {types.filter(t => t.value !== "all").map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newNotification.priority} onValueChange={(value) => setNewNotification(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.filter(p => p.value !== "all").map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="userId">User ID (Optional)</Label>
              <Input
                id="userId"
                value={newNotification.userId}
                onChange={(e) => setNewNotification(prev => ({ ...prev, userId: e.target.value }))}
                placeholder="Leave empty to send to all users"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNotification}>
              <Send className="mr-2 h-4 w-4" />
              Create Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notification? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedNotification && handleDeleteNotification(selectedNotification._id)}
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


