"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Shield, 
  Search, 
  Filter, 
  MoreHorizontal,
  CheckCircle,
  X,
  Clock,
  Eye,
  AlertTriangle,
  Loader2,
  FileText,
  MapPin,
  User,
  Calendar,
  Download,
  Upload
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function AdminKycPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [actionType, setActionType] = useState<string>("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [adminNotes, setAdminNotes] = useState("")

  // Fetch data from backend
  const kycSubmissions = useQuery(api.kyc.getAllKycSubmissions, { limit: 100 })
  const kycStats = useQuery(api.kyc.getKycStats, {})
  
  // Mutations
  const updateKycStatus = useMutation(api.kyc.updateKycStatus)

  const statuses = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "under_review", label: "Under Review" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ]

  const sortOptions = [
    { value: "createdAt", label: "Submission Date" },
    { value: "status", label: "Status" },
    { value: "firstName", label: "Name" },
    { value: "documentType", label: "Document Type" },
  ]

  const filteredAndSortedSubmissions = kycSubmissions?.filter((submission) => {
    const matchesSearch = submission.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.userId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || submission.status === selectedStatus
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

  const handleKycAction = async (submissionId: string, action: string) => {
    try {
      await updateKycStatus({
        submissionId: submissionId as any,
        status: action as any,
        rejectionReason: action === "rejected" ? rejectionReason : undefined,
        adminNotes: adminNotes || undefined,
      })
      
      toast.success(`KYC ${action} successfully`)
      setIsActionModalOpen(false)
      setRejectionReason("")
      setAdminNotes("")
    } catch (error) {
      toast.error(`Failed to ${action} KYC`)
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
      case "under_review":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          <Eye className="mr-1 h-3 w-3" />
          Under Review
        </Badge>
      case "approved":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle className="mr-1 h-3 w-3" />
          Approved
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

  const getDocumentTypeLabel = (type: string) => {
    const types = {
      passport: "Passport",
      drivers_license: "Driver's License",
      national_id: "National ID",
      state_id: "State ID",
      military_id: "Military ID",
    }
    return types[type as keyof typeof types] || type
  }

  const getAddressProofTypeLabel = (type: string) => {
    const types = {
      utility_bill: "Utility Bill",
      bank_statement: "Bank Statement",
      government_letter: "Government Letter",
      rental_agreement: "Rental Agreement",
      insurance_document: "Insurance Document",
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">KYC Management</h1>
          <p className="text-slate-600 dark:text-slate-300">Review and manage user identity verification</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {kycStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Submissions</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{kycStats.total}</p>
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
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Pending Review</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{kycStats.pending}</p>
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
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Under Review</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{kycStats.underReview}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Approved</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{kycStats.approved}</p>
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
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Rejected</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{kycStats.rejected}</p>
                </div>
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="bg-white dark:bg-slate-800">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search by name, document number, or user ID..."
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
        </CardContent>
      </Card>

      {/* KYC Submissions Table */}
      <Card className="bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            KYC Submissions ({filteredAndSortedSubmissions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {kycSubmissions === undefined ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredAndSortedSubmissions.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="No KYC submissions found"
              description={searchTerm || selectedStatus !== "all"
                ? "Try adjusting your search or filter criteria."
                : "No KYC submissions have been made yet."
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Personal Info</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedSubmissions.map((submission) => (
                    <TableRow key={submission._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {submission.firstName.charAt(0)}{submission.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {submission.firstName} {submission.lastName}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {submission.userId.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{getDocumentTypeLabel(submission.documentType)}</p>
                          <p className="text-slate-500">{submission.documentNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{submission.nationality}</p>
                          <p className="text-slate-500">DOB: {submission.dateOfBirth}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{submission.city}, {submission.country}</p>
                          <p className="text-slate-500">{getAddressProofTypeLabel(submission.addressProofType)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(submission.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatDate(submission.createdAt)}</p>
                          <p className="text-slate-500">{formatRelativeTime(submission.createdAt)}</p>
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
                              setSelectedSubmission(submission)
                              setIsSubmissionModalOpen(true)
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {submission.status === "pending" && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedSubmission(submission)
                                    setActionType("under_review")
                                    setIsActionModalOpen(true)
                                  }}
                                  className="text-blue-600"
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Mark Under Review
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedSubmission(submission)
                                    setActionType("approved")
                                    setIsActionModalOpen(true)
                                  }}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedSubmission(submission)
                                    setActionType("rejected")
                                    setIsActionModalOpen(true)
                                  }}
                                  className="text-red-600"
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            {submission.status === "under_review" && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedSubmission(submission)
                                    setActionType("approved")
                                    setIsActionModalOpen(true)
                                  }}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedSubmission(submission)
                                    setActionType("rejected")
                                    setIsActionModalOpen(true)
                                  }}
                                  className="text-red-600"
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Reject
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

      {/* Submission Details Modal */}
      <Dialog open={isSubmissionModalOpen} onOpenChange={setIsSubmissionModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>KYC Submission Details</DialogTitle>
            <DialogDescription>
              Complete information about the KYC submission
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Full Name</Label>
                      <p className="text-sm">{selectedSubmission.firstName} {selectedSubmission.lastName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Date of Birth</Label>
                      <p className="text-sm">{selectedSubmission.dateOfBirth}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Nationality</Label>
                      <p className="text-sm">{selectedSubmission.nationality}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Document Type</Label>
                      <p className="text-sm">{getDocumentTypeLabel(selectedSubmission.documentType)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Document Number</Label>
                      <p className="text-sm">{selectedSubmission.documentNumber}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Address Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Address</Label>
                      <p className="text-sm">{selectedSubmission.address}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">City</Label>
                      <p className="text-sm">{selectedSubmission.city}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">State</Label>
                      <p className="text-sm">{selectedSubmission.state || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Country</Label>
                      <p className="text-sm">{selectedSubmission.country}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Postal Code</Label>
                      <p className="text-sm">{selectedSubmission.postalCode || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Address Proof Type</Label>
                      <p className="text-sm">{getAddressProofTypeLabel(selectedSubmission.addressProofType)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Document Images */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Document Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Document Front</Label>
                      <div className="mt-2 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="flex items-center justify-center h-32 bg-slate-50 dark:bg-slate-800 rounded">
                          <div className="text-center">
                            <FileText className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">Document Front Image</p>
                            <p className="text-xs text-slate-400">ID: {selectedSubmission.documentFrontImage}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Document Back</Label>
                      <div className="mt-2 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="flex items-center justify-center h-32 bg-slate-50 dark:bg-slate-800 rounded">
                          <div className="text-center">
                            <FileText className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">Document Back Image</p>
                            <p className="text-xs text-slate-400">
                              {selectedSubmission.documentBackImage ? `ID: ${selectedSubmission.documentBackImage}` : "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address Proof Image */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Address Proof Document</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex items-center justify-center h-32 bg-slate-50 dark:bg-slate-800 rounded">
                      <div className="text-center">
                        <MapPin className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Address Proof Document</p>
                        <p className="text-xs text-slate-400">ID: {selectedSubmission.addressProofImage}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status and Admin Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Review Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Status:</Label>
                    {getStatusBadge(selectedSubmission.status)}
                  </div>
                  {selectedSubmission.rejectionReason && (
                    <div>
                      <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Rejection Reason</Label>
                      <p className="text-sm mt-1 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        {selectedSubmission.rejectionReason}
                      </p>
                    </div>
                  )}
                  {selectedSubmission.adminNotes && (
                    <div>
                      <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Admin Notes</Label>
                      <p className="text-sm mt-1 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        {selectedSubmission.adminNotes}
                      </p>
                    </div>
                  )}
                  {selectedSubmission.reviewedAt && (
                    <div>
                      <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Reviewed At</Label>
                      <p className="text-sm">{formatDate(selectedSubmission.reviewedAt)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmissionModalOpen(false)}>
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
              {actionType === "approved" ? "Approve KYC" : 
               actionType === "rejected" ? "Reject KYC" : 
               "Mark Under Review"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "approved" ? "Are you sure you want to approve this KYC submission?" :
               actionType === "rejected" ? "Are you sure you want to reject this KYC submission?" :
               "Are you sure you want to mark this KYC submission as under review?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            {actionType === "rejected" && (
              <div>
                <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  rows={3}
                />
              </div>
            )}
            
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
              onClick={() => selectedSubmission && handleKycAction(selectedSubmission._id, actionType)}
              disabled={actionType === "rejected" && !rejectionReason.trim()}
              className={actionType === "approved" ? "bg-green-600 hover:bg-green-700" : 
                        actionType === "rejected" ? "bg-red-600 hover:bg-red-700" : 
                        "bg-blue-600 hover:bg-blue-700"}
            >
              {actionType === "approved" ? "Approve" : 
               actionType === "rejected" ? "Reject" : 
               "Mark Under Review"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
