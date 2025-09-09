"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal,
  UserCheck,
  UserX,
  Shield,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  X,
  Loader2,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  DollarSign,
  Activity,
  UserPlus,
  UserMinus,
  Ban,
  CheckCircle2,
  Clock,
  FileText,
  Settings
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedKycStatus, setSelectedKycStatus] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [isBulkActionModalOpen, setIsBulkActionModalOpen] = useState(false)
  const [bulkAction, setBulkAction] = useState<string>("")

  // Fetch data from backend
  const users = useQuery(api.users.getAllUsers, { limit: 100 })
  const userStats = useQuery(api.users.getUserStats, {})
  const userActivity = useQuery(api.users.getUserActivityLogs, 
    selectedUser ? { userId: selectedUser.userId, limit: 20 } : "skip"
  )
  
  // Mutations
  const deactivateUser = useMutation(api.users.deactivateUser)
  const reactivateUser = useMutation(api.users.reactivateUser)
  const updateVerificationStatus = useMutation(api.users.updateVerificationStatus)
  const bulkUpdateUserStatus = useMutation(api.users.bulkUpdateUserStatus)
  const setUserAsAdmin = useMutation(api.users.setUserAsAdmin)

  const roles = [
    { value: "all", label: "All Roles" },
    { value: "user", label: "Users" },
    { value: "admin", label: "Admins" },
  ]

  const kycStatuses = [
    { value: "all", label: "All KYC Status" },
    { value: "not_submitted", label: "Not Submitted" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ]

  const statuses = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ]

  const sortOptions = [
    { value: "createdAt", label: "Join Date" },
    { value: "lastLoginAt", label: "Last Login" },
    { value: "role", label: "Role" },
    { value: "kycStatus", label: "KYC Status" },
    { value: "isActive", label: "Status" },
  ]

  const bulkActions = [
    { value: "activate", label: "Activate Users", icon: UserCheck },
    { value: "deactivate", label: "Deactivate Users", icon: UserX },
    { value: "verify", label: "Verify KYC", icon: ShieldCheck },
    { value: "reject_kyc", label: "Reject KYC", icon: X },
  ]

  const filteredAndSortedUsers = users?.filter((user) => {
    const matchesSearch = user.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.phoneNumber && user.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesRole = selectedRole === "all" || user.role === selectedRole
    const matchesKycStatus = selectedKycStatus === "all" || user.kycStatus === selectedKycStatus
    const matchesStatus = selectedStatus === "all" || 
                         (selectedStatus === "active" && user.isActive) ||
                         (selectedStatus === "inactive" && !user.isActive)
    return matchesSearch && matchesRole && matchesKycStatus && matchesStatus
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

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredAndSortedUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredAndSortedUsers.map(user => user.userId))
    }
  }

  const handleUserAction = async (userId: string, action: string) => {
    try {
      switch (action) {
        case "deactivate":
          await deactivateUser({ userId })
          toast.success("User deactivated successfully")
          break
        case "reactivate":
          await reactivateUser({ userId })
          toast.success("User reactivated successfully")
          break
        case "verify":
          await updateVerificationStatus({ 
            targetUserId: userId, 
            identityVerified: true,
            kycStatus: "approved"
          })
          toast.success("User verified successfully")
          break
        case "reject_kyc":
          await updateVerificationStatus({ 
            targetUserId: userId, 
            kycStatus: "rejected"
          })
          toast.success("KYC rejected successfully")
          break
        case "make_admin":
          await setUserAsAdmin({ userId })
          toast.success("User promoted to admin")
          break
      }
    } catch (error) {
      toast.error(`Failed to ${action} user`)
      console.error(error)
    }
  }

  const handleBulkAction = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select users first")
      return
    }

    try {
      await bulkUpdateUserStatus({
        userIds: selectedUsers,
        action: bulkAction as any
      })
      toast.success(`Bulk action completed for ${selectedUsers.length} users`)
      setSelectedUsers([])
      setIsBulkActionModalOpen(false)
    } catch (error) {
      toast.error("Failed to perform bulk action")
      console.error(error)
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        <CheckCircle className="mr-1 h-3 w-3" />
        Active
      </Badge>
    ) : (
      <Badge variant="outline" className="text-red-600 border-red-200">
        <X className="mr-1 h-3 w-3" />
        Inactive
      </Badge>
    )
  }

  const getKycBadge = (kycStatus: string) => {
    const colors = {
      not_submitted: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    }
    
    return (
      <Badge className={colors[kycStatus as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {kycStatus.replace("_", " ").toUpperCase()}
      </Badge>
    )
  }

  const getRoleBadge = (role: string) => {
    return role === "admin" ? (
      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
        <Shield className="mr-1 h-3 w-3" />
        Admin
      </Badge>
    ) : (
      <Badge variant="outline">
        <Users className="mr-1 h-3 w-3" />
        User
      </Badge>
    )
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">User Management</h1>
          <p className="text-slate-600 dark:text-slate-300">Manage users, roles, and verification status</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Users</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{userStats.totalUsers}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Active Users</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{userStats.activeUsers}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Verified Users</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{userStats.verifiedUsers}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Pending KYC</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{userStats.pendingKyc}</p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
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
            {/* Search and View Mode */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search users by ID or phone..."
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 block">Role</label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 block">KYC Status</label>
                <Select value={selectedKycStatus} onValueChange={setSelectedKycStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {kycStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 block">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
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
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 block">Sort By</label>
                <div className="flex space-x-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="flex-1">
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

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedUsers([])}
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

      {/* Users Display */}
      <Card className="bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Users ({filteredAndSortedUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users === undefined ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredAndSortedUsers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No users found"
              description={searchTerm || selectedRole !== "all" || selectedKycStatus !== "all" || selectedStatus !== "all"
                ? "Try adjusting your search or filter criteria."
                : "No users have been registered yet."
              }
            />
          ) : viewMode === "table" ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedUsers.length === filteredAndSortedUsers.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>KYC Status</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedUsers.map((user) => (
                    <TableRow key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.includes(user.userId)}
                          onCheckedChange={() => handleSelectUser(user.userId)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {user.userId.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {user.userId.slice(0, 8)}...
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {user.phoneNumber || "No phone"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell>
                        {getKycBadge(user.kycStatus)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.isActive)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.lastLoginAt ? (
                            <>
                              <p>{formatDate(user.lastLoginAt)}</p>
                              <p className="text-slate-500">{formatRelativeTime(user.lastLoginAt)}</p>
                            </>
                          ) : (
                            <span className="text-slate-500">Never</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatDate(user.createdAt)}</p>
                          <p className="text-slate-500">{formatRelativeTime(user.createdAt)}</p>
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
                              setSelectedUser(user)
                              setIsUserModalOpen(true)
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser(user)
                              setIsActivityModalOpen(true)
                            }}>
                              <Activity className="mr-2 h-4 w-4" />
                              View Activity
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.isActive ? (
                              <DropdownMenuItem 
                                onClick={() => handleUserAction(user.userId, "deactivate")}
                                className="text-red-600"
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => handleUserAction(user.userId, "reactivate")}
                                className="text-green-600"
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Reactivate
                              </DropdownMenuItem>
                            )}
                            {user.kycStatus === "pending" && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleUserAction(user.userId, "verify")}
                                  className="text-green-600"
                                >
                                  <ShieldCheck className="mr-2 h-4 w-4" />
                                  Approve KYC
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleUserAction(user.userId, "reject_kyc")}
                                  className="text-red-600"
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Reject KYC
                                </DropdownMenuItem>
                              </>
                            )}
                            {user.role === "user" && (
                              <DropdownMenuItem 
                                onClick={() => handleUserAction(user.userId, "make_admin")}
                                className="text-purple-600"
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Make Admin
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
          ) : (
            // Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedUsers.map((user) => (
                <Card key={user._id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback>
                            {user.userId.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {user.userId.slice(0, 12)}...
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {user.phoneNumber || "No phone"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getStatusBadge(user.isActive)}
                        {user.role === "admin" && (
                          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            Admin
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      {getRoleBadge(user.role)}
                      {getKycBadge(user.kycStatus)}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-300">Last Login</span>
                        <span className="font-medium">
                          {user.lastLoginAt ? formatRelativeTime(user.lastLoginAt) : "Never"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-300">Joined</span>
                        <span className="font-medium">{formatRelativeTime(user.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user)
                          setIsUserModalOpen(true)
                        }}
                        className="flex-1"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user)
                            setIsActivityModalOpen(true)
                          }}>
                            <Activity className="mr-2 h-4 w-4" />
                            Activity
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.isActive ? (
                            <DropdownMenuItem 
                              onClick={() => handleUserAction(user.userId, "deactivate")}
                              className="text-red-600"
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => handleUserAction(user.userId, "reactivate")}
                              className="text-green-600"
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Reactivate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete information about the selected user
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-lg">
                    {selectedUser.userId.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.userId}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {getRoleBadge(selectedUser.role)}
                    {getStatusBadge(selectedUser.isActive)}
                    {getKycBadge(selectedUser.kycStatus)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Phone Number</label>
                  <p className="text-sm">{selectedUser.phoneNumber || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Address</label>
                  <p className="text-sm">{selectedUser.address || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">City</label>
                  <p className="text-sm">{selectedUser.city || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Country</label>
                  <p className="text-sm">{selectedUser.country || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Occupation</label>
                  <p className="text-sm">{selectedUser.occupation || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Company</label>
                  <p className="text-sm">{selectedUser.company || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Joined</label>
                  <p className="text-sm">{formatDate(selectedUser.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Last Login</label>
                  <p className="text-sm">
                    {selectedUser.lastLoginAt ? formatDate(selectedUser.lastLoginAt) : "Never"}
                  </p>
                </div>
              </div>

              {selectedUser.bio && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Bio</label>
                  <p className="text-sm mt-1">{selectedUser.bio}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Activity Modal */}
      <Dialog open={isActivityModalOpen} onOpenChange={setIsActivityModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>User Activity</DialogTitle>
            <DialogDescription>
              Recent activity for {selectedUser?.userId}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {userActivity === undefined ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : userActivity.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="No activity found"
                description="This user hasn't performed any activities yet."
              />
            ) : (
              <div className="space-y-4">
                {userActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {activity.type === 'transaction' && `Transaction: ${activity.type}`}
                        {activity.type === 'investment' && `Investment: ${activity.amount} ${activity.currency}`}
                        {activity.type === 'notification' && `Notification: ${activity.title}`}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {formatDate(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActivityModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Modal */}
      <AlertDialog open={isBulkActionModalOpen} onOpenChange={setIsBulkActionModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bulk Action</AlertDialogTitle>
            <AlertDialogDescription>
              Select an action to perform on {selectedUsers.length} selected users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 block">Action</label>
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
