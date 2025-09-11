"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase, 
  Building, 
  Camera,
  Save,
  Shield,
  CheckCircle,
  AlertTriangle
} from "lucide-react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { toast } from "sonner"
import { useAuthStore } from "@/lib/store"
import { FileUpload } from "@/components/ui/file-upload"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    city: "",
    country: "",
    dateOfBirth: "",
    occupation: "",
    company: "",
    bio: "",
  })

  // Fetch user profile data
  const userProfile = useQuery(api.users.getCurrentUserProfile, {})
  const kycStatus = useQuery(api.kyc.getUserKycSubmission, {})
  const canPerformActions = useQuery(api.kyc.canPerformFinancialActions, {})
  
  // Get profile image URL if image exists
  const profileImageUrl = useQuery(
    api.files.getFileUrl, 
    profileImage ? { fileId: profileImage as any } : "skip"
  )

  // Mutations
  const updateUserProfile = useMutation(api.users.updateUserProfile)

  // Initialize form data when user profile loads
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        phoneNumber: userProfile.phoneNumber || "",
        address: userProfile.address || "",
        city: userProfile.city || "",
        country: userProfile.country || "",
        dateOfBirth: userProfile.dateOfBirth || "",
        occupation: userProfile.occupation || "",
        company: userProfile.company || "",
        bio: userProfile.bio || "",
      })
      setProfileImage(userProfile.image || null)
    }
  }, [userProfile])

  const handleSave = async () => {
    if (!userProfile) return

    try {
      await updateUserProfile({
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        dateOfBirth: formData.dateOfBirth,
        occupation: formData.occupation,
        company: formData.company,
        bio: formData.bio,
        image: profileImage || undefined,
      })
      
      toast.success("Profile updated successfully")
      setIsEditing(false)
    } catch (error) {
      toast.error("Failed to update profile")
      console.error(error)
    }
  }

  const handleImageUpload = (fileId: string) => {
    setProfileImage(fileId)
  }

  const getKycStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle className="mr-1 h-3 w-3" />
          Approved
        </Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Rejected
        </Badge>
      default:
        return <Badge variant="outline">
          Not Submitted
        </Badge>
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Profile</h1>
          <p className="text-slate-600 dark:text-slate-300">Manage your account information and settings</p>
        </div>
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profileImageUrl || undefined} />
                  <AvatarFallback className="text-2xl">
                    {userProfile.name?.charAt(0) || user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div className="absolute -bottom-2 -right-2">
                    <FileUpload
                      onUploadComplete={handleImageUpload}
                      accept="image/*"
                      maxSize={2 * 1024 * 1024} // 2MB
                      className="w-8 h-8"
                      label=""
                    />
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {userProfile.name}
                </h2>
                <p className="text-slate-600 dark:text-slate-400">{user?.email}</p>
                <div className="mt-2">
                  {getKycStatusBadge(userProfile.kycStatus)}
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Account Status</span>
                <Badge variant={userProfile.isActive ? "default" : "destructive"}>
                  {userProfile.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Email Verified</span>
                <Badge variant={userProfile.identityVerified ? "default" : "destructive"}>
                  {userProfile.identityVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Role</span>
                <Badge variant="outline">
                  {userProfile.role}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KYC Status */}
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              KYC Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                {getKycStatusBadge(userProfile.kycStatus)}
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  {userProfile.kycStatus === "approved" 
                    ? "Your identity has been verified"
                    : userProfile.kycStatus === "pending"
                    ? "Your verification is under review"
                    : userProfile.kycStatus === "rejected"
                    ? "Your verification was rejected"
                    : "Complete KYC verification to access all features"
                  }
                </p>
              </div>

              {canPerformActions && !canPerformActions.canPerform && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    {canPerformActions.reason}
                  </p>
                </div>
              )}

              <Button 
                className="w-full" 
                variant={userProfile.kycStatus === "approved" ? "outline" : "default"}
                onClick={() => window.location.href = "/dashboard/kyc"}
              >
                {userProfile.kycStatus === "approved" ? "View KYC Details" : "Complete KYC"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Statistics */}
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Account Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Member Since</span>
                <span className="text-sm font-medium">
                  {formatDate(userProfile.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Last Login</span>
                <span className="text-sm font-medium">
                  {userProfile.lastLoginAt ? formatDate(userProfile.lastLoginAt) : "Never"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Profile Updated</span>
                <span className="text-sm font-medium">
                  {formatDate(userProfile.updatedAt)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Details Form */}
      <Card className="bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                value={formData.occupation}
                onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                disabled={!isEditing}
                rows={3}
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}