"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Shield, 
  Upload, 
  CheckCircle, 
  X, 
  AlertTriangle, 
  Clock, 
  FileText,
  MapPin,
  Camera,
  Image as ImageIcon,
  Loader2,
  Eye,
  Download
} from "lucide-react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { toast } from "sonner"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { useConvexAuth } from "convex/react"

export default function KycPage() {
  const { isAuthenticated } = useConvexAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<{ [key: string]: boolean }>({})
  
  // Form data
  const [formData, setFormData] = useState({
    // Document verification
    documentType: "",
    documentNumber: "",
    documentFrontImage: "",
    documentBackImage: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "",
    
    // Address verification
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    addressProofType: "",
    addressProofImage: "",
  })

  // Fetch data
  const kycSubmission = useQuery(api.kyc.getUserKycSubmission, {})
  const canPerformActions = useQuery(api.kyc.canPerformFinancialActions, {})
  const documentTypes = useQuery(api.kyc.getSupportedDocumentTypes, {})
  const addressProofTypes = useQuery(api.kyc.getSupportedAddressProofTypes, {})
  
  // Mutations
  const submitKyc = useMutation(api.kyc.submitKyc)
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)

  // Initialize form with existing data
  useEffect(() => {
    if (kycSubmission) {
      setFormData({
        documentType: kycSubmission.documentType || "",
        documentNumber: kycSubmission.documentNumber || "",
        documentFrontImage: kycSubmission.documentFrontImage || "",
        documentBackImage: kycSubmission.documentBackImage || "",
        firstName: kycSubmission.firstName || "",
        lastName: kycSubmission.lastName || "",
        dateOfBirth: kycSubmission.dateOfBirth || "",
        nationality: kycSubmission.nationality || "",
        address: kycSubmission.address || "",
        city: kycSubmission.city || "",
        state: kycSubmission.state || "",
        country: kycSubmission.country || "",
        postalCode: kycSubmission.postalCode || "",
        addressProofType: kycSubmission.addressProofType || "",
        addressProofImage: kycSubmission.addressProofImage || "",
      })
    }
  }, [kycSubmission])

  const handleFileUpload = async (file: File, field: string) => {
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, or WebP)")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    setUploadingFiles(prev => ({ ...prev, [field]: true }))

    try {
      const uploadUrl = await generateUploadUrl()
      
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      })

      const { storageId } = await response.json()
      
      setFormData(prev => ({ ...prev, [field]: storageId }))
      toast.success("File uploaded successfully")
    } catch (error) {
      toast.error("Failed to upload file")
      console.error(error)
    } finally {
      setUploadingFiles(prev => ({ ...prev, [field]: false }))
    }
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.documentType || !formData.documentNumber || !formData.documentFrontImage) {
      toast.error("Please complete all required fields in Document Verification")
      setCurrentStep(1)
      return
    }

    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.nationality) {
      toast.error("Please complete all personal information fields")
      setCurrentStep(1)
      return
    }

    if (!formData.address || !formData.city || !formData.country || !formData.addressProofType || !formData.addressProofImage) {
      toast.error("Please complete all required fields in Address Verification")
      setCurrentStep(2)
      return
    }

    setIsSubmitting(true)
    try {
      await submitKyc({
        documentType: formData.documentType as any,
        documentNumber: formData.documentNumber,
        documentFrontImage: formData.documentFrontImage,
        documentBackImage: formData.documentBackImage || undefined,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        nationality: formData.nationality,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postalCode: formData.postalCode,
        addressProofType: formData.addressProofType as any,
        addressProofImage: formData.addressProofImage,
      })
      
      toast.success("KYC submission successful! Your documents are under review.")
    } catch (error) {
      toast.error("Failed to submit KYC documents")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <Clock className="mr-1 h-3 w-3" />
          Pending Review
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

  if (!isAuthenticated) {
    return <LoadingSpinner size="lg" text="Loading..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">KYC Verification</h1>
            <p className="text-slate-600 dark:text-slate-300">
              Complete your identity verification to access all platform features
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {kycSubmission && getStatusBadge(kycSubmission.status)}
            {canPerformActions?.canPerform && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <CheckCircle className="mr-1 h-3 w-3" />
                Verified
              </Badge>
            )}
          </div>
        </div>

        {/* Status Message */}
        {kycSubmission && (
          <div className={`p-4 rounded-lg ${
            kycSubmission.status === "approved" 
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              : kycSubmission.status === "rejected"
              ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
          }`}>
            <div className="flex items-start space-x-2">
              {kycSubmission.status === "approved" ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : kycSubmission.status === "rejected" ? (
                <X className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`font-medium ${
                  kycSubmission.status === "approved" 
                    ? "text-green-800 dark:text-green-200"
                    : kycSubmission.status === "rejected"
                    ? "text-red-800 dark:text-red-200"
                    : "text-blue-800 dark:text-blue-200"
                }`}>
                  {kycSubmission.status === "approved" 
                    ? "Verification Approved"
                    : kycSubmission.status === "rejected"
                    ? "Verification Rejected"
                    : "Verification Under Review"
                  }
                </p>
                <p className={`text-sm mt-1 ${
                  kycSubmission.status === "approved" 
                    ? "text-green-700 dark:text-green-300"
                    : kycSubmission.status === "rejected"
                    ? "text-red-700 dark:text-red-300"
                    : "text-blue-700 dark:text-blue-300"
                }`}>
                  {kycSubmission.status === "approved" 
                    ? "Your identity has been verified. You can now make deposits, investments, and withdrawals."
                    : kycSubmission.status === "rejected"
                    ? kycSubmission.rejectionReason || "Please check your documents and resubmit."
                    : "We're reviewing your documents. You'll be notified once the review is complete."
                  }
                </p>
                {kycSubmission.adminNotes && (
                  <p className="text-sm mt-2 text-slate-600 dark:text-slate-300">
                    <strong>Admin Notes:</strong> {kycSubmission.adminNotes}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KYC Form */}
      {(!kycSubmission || kycSubmission.status === "rejected") && (
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Identity Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={currentStep === 1 ? "document" : "address"} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="document" onClick={() => setCurrentStep(1)}>
                  Document Verification
                </TabsTrigger>
                <TabsTrigger value="address" onClick={() => setCurrentStep(2)}>
                  Address Verification
                </TabsTrigger>
              </TabsList>

              <TabsContent value="document" className="space-y-6">
                {/* Document Type */}
                <div>
                  <Label htmlFor="documentType">Document Type *</Label>
                  <Select value={formData.documentType} onValueChange={(value) => setFormData({ ...formData, documentType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes?.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-slate-500">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Document Number */}
                <div>
                  <Label htmlFor="documentNumber">Document Number *</Label>
                  <Input
                    id="documentNumber"
                    value={formData.documentNumber}
                    onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                    placeholder="Enter document number"
                  />
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nationality">Nationality *</Label>
                    <Input
                      id="nationality"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      placeholder="Enter nationality"
                    />
                  </div>
                </div>

                {/* Document Upload */}
                <div className="space-y-4">
                  <div>
                    <Label>Document Front Image *</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file, "documentFrontImage")
                        }}
                        className="hidden"
                        id="documentFrontImage"
                      />
                      <label
                        htmlFor="documentFrontImage"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      >
                        {uploadingFiles.documentFrontImage ? (
                          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                        ) : formData.documentFrontImage ? (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                            <span className="text-sm text-green-600">Uploaded</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="w-8 h-8 text-slate-400" />
                            <span className="text-sm text-slate-500">Click to upload front image</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label>Document Back Image (if applicable)</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file, "documentBackImage")
                        }}
                        className="hidden"
                        id="documentBackImage"
                      />
                      <label
                        htmlFor="documentBackImage"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      >
                        {uploadingFiles.documentBackImage ? (
                          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                        ) : formData.documentBackImage ? (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                            <span className="text-sm text-green-600">Uploaded</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="w-8 h-8 text-slate-400" />
                            <span className="text-sm text-slate-500">Click to upload back image</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setCurrentStep(2)} className="bg-blue-600 hover:bg-blue-700">
                    Next: Address Verification
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="address" className="space-y-6">
                {/* Address Information */}
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter street address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="Enter state or province"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="Enter country"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      placeholder="Enter postal code"
                    />
                  </div>
                </div>

                {/* Address Proof Type */}
                <div>
                  <Label htmlFor="addressProofType">Address Proof Type *</Label>
                  <Select value={formData.addressProofType} onValueChange={(value) => setFormData({ ...formData, addressProofType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select address proof type" />
                    </SelectTrigger>
                    <SelectContent>
                      {addressProofTypes?.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-slate-500">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Address Proof Upload */}
                <div>
                  <Label>Address Proof Document *</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file, "addressProofImage")
                      }}
                      className="hidden"
                      id="addressProofImage"
                    />
                    <label
                      htmlFor="addressProofImage"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      {uploadingFiles.addressProofImage ? (
                        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                      ) : formData.addressProofImage ? (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-8 h-8 text-green-500" />
                          <span className="text-sm text-green-600">Uploaded</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="w-8 h-8 text-slate-400" />
                          <span className="text-sm text-slate-500">Click to upload address proof</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Back: Document Verification
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Submit KYC
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Requirements Info */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">KYC Requirements</h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Clear, high-quality images of your government-issued ID</li>
                <li>• All text must be clearly readable</li>
                <li>• Documents must be valid and not expired</li>
                <li>• Address proof must be recent (within 3 months)</li>
                <li>• All personal information must match your account details</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
