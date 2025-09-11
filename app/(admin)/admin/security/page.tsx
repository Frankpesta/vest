"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Shield, 
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
  User,
  Calendar,
  Lock,
  Unlock,
  Ban,
  Check,
  AlertCircle,
  Activity,
  Key,
  Globe,
  Smartphone,
  Monitor
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

export default function AdminSecurityPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedSeverity, setSelectedSeverity] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [actionType, setActionType] = useState<string>("")

  // Mock security events data (in a real app, this would come from the backend)
  const securityEvents = [
    {
      id: "1",
      type: "login_attempt",
      severity: "medium",
      status: "resolved",
      userId: "user_123",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      location: "New York, US",
      description: "Successful login from new device",
      createdAt: Date.now() - 1000 * 60 * 30, // 30 minutes ago
      resolvedAt: Date.now() - 1000 * 60 * 25, // 25 minutes ago
    },
    {
      id: "2",
      type: "failed_login",
      severity: "high",
      status: "pending",
      userId: "user_456",
      ipAddress: "203.0.113.42",
      userAgent: "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36",
      location: "Unknown",
      description: "Multiple failed login attempts",
      createdAt: Date.now() - 1000 * 60 * 15, // 15 minutes ago
      resolvedAt: null,
    },
    {
      id: "3",
      type: "suspicious_activity",
      severity: "urgent",
      status: "investigating",
      userId: "user_789",
      ipAddress: "198.51.100.1",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      location: "San Francisco, US",
      description: "Unusual transaction pattern detected",
      createdAt: Date.now() - 1000 * 60 * 5, // 5 minutes ago
      resolvedAt: null,
    },
    {
      id: "4",
      type: "password_change",
      severity: "low",
      status: "resolved",
      userId: "user_321",
      ipAddress: "192.168.1.200",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1) AppleWebKit/605.1.15",
      location: "Los Angeles, US",
      description: "Password successfully changed",
      createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
      resolvedAt: Date.now() - 1000 * 60 * 60 * 1.5, // 1.5 hours ago
    },
    {
      id: "5",
      type: "account_locked",
      severity: "high",
      status: "resolved",
      userId: "user_654",
      ipAddress: "203.0.113.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      location: "Unknown",
      description: "Account locked due to suspicious activity",
      createdAt: Date.now() - 1000 * 60 * 60 * 4, // 4 hours ago
      resolvedAt: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
    },
  ]

  const statuses = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "investigating", label: "Investigating" },
    { value: "resolved", label: "Resolved" },
    { value: "dismissed", label: "Dismissed" },
  ]

  const severities = [
    { value: "all", label: "All Severities" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ]

  const eventTypes = [
    { value: "all", label: "All Types" },
    { value: "login_attempt", label: "Login Attempt" },
    { value: "failed_login", label: "Failed Login" },
    { value: "suspicious_activity", label: "Suspicious Activity" },
    { value: "password_change", label: "Password Change" },
    { value: "account_locked", label: "Account Locked" },
    { value: "data_breach", label: "Data Breach" },
    { value: "unauthorized_access", label: "Unauthorized Access" },
  ]

  const sortOptions = [
    { value: "createdAt", label: "Date" },
    { value: "severity", label: "Severity" },
    { value: "status", label: "Status" },
    { value: "type", label: "Type" },
  ]

  const filteredAndSortedEvents = securityEvents.filter((event) => {
    const matchesSearch = event.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.ipAddress.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || event.status === selectedStatus
    const matchesSeverity = selectedSeverity === "all" || event.severity === selectedSeverity
    return matchesSearch && matchesStatus && matchesSeverity
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
  })

  const handleSelectEvent = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    )
  }

  const handleSelectAll = () => {
    if (selectedEvents.length === filteredAndSortedEvents.length) {
      setSelectedEvents([])
    } else {
      setSelectedEvents(filteredAndSortedEvents.map(event => event.id))
    }
  }

  const handleEventAction = async (eventId: string, action: string) => {
    try {
      // In a real app, this would call a backend mutation
      toast.success(`Event ${action} successfully`)
      setIsActionModalOpen(false)
    } catch (error) {
      toast.error(`Failed to ${action} event`)
      console.error(error)
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      case "investigating":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          <Activity className="mr-1 h-3 w-3" />
          Investigating
        </Badge>
      case "resolved":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle className="mr-1 h-3 w-3" />
          Resolved
        </Badge>
      case "dismissed":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
          <X className="mr-1 h-3 w-3" />
          Dismissed
        </Badge>
      default:
        return null
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "login_attempt":
        return <Key className="h-4 w-4" />
      case "failed_login":
        return <Lock className="h-4 w-4" />
      case "suspicious_activity":
        return <AlertCircle className="h-4 w-4" />
      case "password_change":
        return <Shield className="h-4 w-4" />
      case "account_locked":
        return <Ban className="h-4 w-4" />
      case "data_breach":
        return <AlertTriangle className="h-4 w-4" />
      case "unauthorized_access":
        return <Unlock className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
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
    total: securityEvents.length,
    pending: securityEvents.filter(e => e.status === "pending").length,
    investigating: securityEvents.filter(e => e.status === "investigating").length,
    resolved: securityEvents.filter(e => e.status === "resolved").length,
    urgent: securityEvents.filter(e => e.severity === "urgent").length,
    high: securityEvents.filter(e => e.severity === "high").length,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Security Monitoring</h1>
          <p className="text-slate-600 dark:text-slate-300">Monitor security events and threats</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline">
            <Activity className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Events</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Urgent</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.urgent}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Resolved</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.resolved}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Tabs */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="threats">Active Threats</TabsTrigger>
          <TabsTrigger value="users">User Security</TabsTrigger>
          <TabsTrigger value="settings">Security Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          {/* Filters */}
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Search by user ID, description, or IP address..."
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
                    <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {severities.map((severity) => (
                          <SelectItem key={severity.value} value={severity.value}>
                            {severity.label}
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

          {/* Security Events Table */}
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Security Events ({filteredAndSortedEvents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredAndSortedEvents.length === 0 ? (
                <EmptyState
                  icon={Shield}
                  title="No security events found"
                  description={searchTerm || selectedStatus !== "all" || selectedSeverity !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "No security events have been recorded yet."
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedEvents.length === filteredAndSortedEvents.length}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedEvents.map((event) => (
                        <TableRow key={event.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                          <TableCell>
                            <Checkbox
                              checked={selectedEvents.includes(event.id)}
                              onCheckedChange={() => handleSelectEvent(event.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getEventTypeIcon(event.type)}
                              <span className="text-sm font-medium capitalize">
                                {event.type.replace('_', ' ')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm max-w-xs">
                              <p className="font-medium truncate">{event.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="font-mono">{event.userId}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="font-mono">{event.ipAddress}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{event.location}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getSeverityBadge(event.severity)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(event.status)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{formatDate(event.createdAt)}</p>
                              <p className="text-slate-500">{formatRelativeTime(event.createdAt)}</p>
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
                                  setSelectedEvent(event)
                                  setIsEventModalOpen(true)
                                }}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {event.status === "pending" && (
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedEvent(event)
                                      setActionType("investigating")
                                      setIsActionModalOpen(true)
                                    }}
                                    className="text-blue-600"
                                  >
                                    <Activity className="mr-2 h-4 w-4" />
                                    Mark Investigating
                                  </DropdownMenuItem>
                                )}
                                {(event.status === "pending" || event.status === "investigating") && (
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedEvent(event)
                                      setActionType("resolved")
                                      setIsActionModalOpen(true)
                                    }}
                                    className="text-green-600"
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Mark Resolved
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedEvent(event)
                                    setActionType("dismissed")
                                    setIsActionModalOpen(true)
                                  }}
                                  className="text-gray-600"
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Dismiss
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
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle>Active Threats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500">No active threats detected</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle>User Security Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500">User security monitoring would go here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500">Security configuration settings would go here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Event Details Modal */}
      <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Security Event Details</DialogTitle>
            <DialogDescription>
              Complete information about the selected security event
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Event Type</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getEventTypeIcon(selectedEvent.type)}
                    <span className="text-sm font-medium capitalize">
                      {selectedEvent.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Severity</Label>
                  <div className="mt-1">{getSeverityBadge(selectedEvent.severity)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedEvent.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">User ID</Label>
                  <p className="text-sm font-mono">{selectedEvent.userId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">IP Address</Label>
                  <p className="text-sm font-mono">{selectedEvent.ipAddress}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Location</Label>
                  <p className="text-sm">{selectedEvent.location}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Created</Label>
                  <p className="text-sm">{formatDate(selectedEvent.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Resolved</Label>
                  <p className="text-sm">{selectedEvent.resolvedAt ? formatDate(selectedEvent.resolvedAt) : "Not resolved"}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Description</Label>
                <p className="text-sm mt-1 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  {selectedEvent.description}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">User Agent</Label>
                <p className="text-sm mt-1 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg font-mono text-xs">
                  {selectedEvent.userAgent}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEventModalOpen(false)}>
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
              {actionType === "investigating" ? "Mark as Investigating" : 
               actionType === "resolved" ? "Mark as Resolved" : "Dismiss Event"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "investigating" ? "Are you sure you want to mark this event as investigating?" :
               actionType === "resolved" ? "Are you sure you want to mark this event as resolved?" :
               "Are you sure you want to dismiss this event?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedEvent && handleEventAction(selectedEvent.id, actionType)}
              className={actionType === "dismissed" ? "bg-gray-600 hover:bg-gray-700" : 
                        actionType === "resolved" ? "bg-green-600 hover:bg-green-700" : 
                        "bg-blue-600 hover:bg-blue-700"}
            >
              {actionType === "investigating" ? "Mark Investigating" : 
               actionType === "resolved" ? "Mark Resolved" : "Dismiss"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
