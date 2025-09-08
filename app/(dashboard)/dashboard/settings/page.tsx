"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  Wallet, 
  Shield, 
  Bell, 
  Globe, 
  Eye, 
  EyeOff, 
  Key, 
  Smartphone, 
  Mail, 
  Save, 
  AlertCircle,
  CheckCircle,
  Settings as SettingsIcon,
  CreditCard,
  Lock,
  User,
  Moon,
  Sun,
  Loader2
} from "lucide-react"
import { useAuthStore } from "@/lib/store"
import { useWalletStore } from "@/lib/stores/wallet-store"
import { toast } from "sonner"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function SettingsPage() {
  const { connection, connectWallet, disconnectWallet } = useWalletStore()
  const { user } = useAuthStore()
  
  // Fetch settings from backend
  const userSettings = useQuery(api.userSettings.getUserSettings, {})
  const activeSessions = useQuery(api.userSettings.getActiveSessions, {})
  
  // Mutations
  const updateSettings = useMutation(api.userSettings.updateUserSettings)
  const changePassword = useMutation(api.userSettings.changePassword)
  const toggleTwoFactor = useMutation(api.userSettings.toggleTwoFactorAuth)
  const revokeSession = useMutation(api.userSettings.revokeSession)
  
  const [settings, setSettings] = useState({
    // Wallet Settings
    autoConnect: true,
    showBalance: true,
    
    // Security Settings
    twoFactorAuth: false,
    emailNotifications: true,
    smsNotifications: false,
    loginAlerts: true,
    
    // Privacy Settings
    profileVisibility: "private",
    dataSharing: false,
    analytics: true,
    
    // Display Settings
    theme: "system",
    language: "en",
    currency: "USD",
    timezone: "UTC-8",
    
    // Investment Settings
    riskTolerance: "medium",
    autoReinvest: false,
    investmentAlerts: true,
  })

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Update local settings when backend data loads
  useEffect(() => {
    if (userSettings) {
      setSettings(userSettings)
    }
  }, [userSettings])

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      await updateSettings({
        ...settings,
        profileVisibility: settings.profileVisibility as "public" | "private" | "friends",
        theme: settings.theme as "light" | "dark" | "system",
        riskTolerance: settings.riskTolerance as "low" | "medium" | "high",
      })
      toast.success("Settings saved successfully!")
    } catch (error) {
      toast.error("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }
    
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      toast.success("Password changed successfully!")
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error) {
      toast.error("Failed to change password")
    }
  }

  const handleToggleTwoFactor = async (enabled: boolean) => {
    try {
      await toggleTwoFactor({ enabled })
      setSettings({ ...settings, twoFactorAuth: enabled })
      toast.success(`Two-factor authentication ${enabled ? 'enabled' : 'disabled'}`)
    } catch (error) {
      toast.error("Failed to update two-factor authentication")
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSession({ sessionId })
      toast.success("Session revoked successfully")
    } catch (error) {
      toast.error("Failed to revoke session")
    }
  }

  const securityFeatures = [
    {
      title: "Two-Factor Authentication",
      description: "Add an extra layer of security with 2FA",
      enabled: settings.twoFactorAuth,
      onToggle: handleToggleTwoFactor,
      icon: Shield,
      color: "text-green-600",
    },
    {
      title: "Email Notifications",
      description: "Get notified about important account activities",
      enabled: settings.emailNotifications,
      onToggle: (enabled: boolean) => setSettings({ ...settings, emailNotifications: enabled }),
      icon: Mail,
      color: "text-blue-600",
    },
    {
      title: "SMS Notifications",
      description: "Receive SMS alerts for critical activities",
      enabled: settings.smsNotifications,
      onToggle: (enabled: boolean) => setSettings({ ...settings, smsNotifications: enabled }),
      icon: Smartphone,
      color: "text-purple-600",
    },
    {
      title: "Login Alerts",
      description: "Get notified when someone logs into your account",
      enabled: settings.loginAlerts,
      onToggle: (enabled: boolean) => setSettings({ ...settings, loginAlerts: enabled }),
      icon: Lock,
      color: "text-red-600",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Settings</h1>
            <p className="text-slate-600 dark:text-slate-300">Manage your account preferences and security settings</p>
          </div>
          <Button 
            onClick={handleSaveSettings} 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="wallet" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="investment">Investment</TabsTrigger>
        </TabsList>

        <TabsContent value="wallet" className="space-y-6">
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wallet className="mr-2 h-5 w-5" />
                Wallet Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Wallet Connection</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {connection?.isConnected ? "Connected" : "Not connected"}
                    </p>
                    {connection?.isConnected && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {connection.address?.slice(0, 8)}...{connection.address?.slice(-6)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={connection?.isConnected ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}>
                    {connection?.isConnected ? "Connected" : "Disconnected"}
                  </Badge>
                  <Button 
                    variant="outline" 
                    onClick={() => connection?.isConnected ? disconnectWallet() : connectWallet()}
                  >
                    {connection?.isConnected ? "Disconnect" : "Connect"}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoConnect">Auto-connect Wallet</Label>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Automatically connect wallet when visiting the site
                    </p>
                  </div>
                  <Switch
                    id="autoConnect"
                    checked={settings.autoConnect}
                    onCheckedChange={(checked) => setSettings({ ...settings, autoConnect: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showBalance">Show Balance</Label>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Display wallet balance in the header
                    </p>
                  </div>
                  <Switch
                    id="showBalance"
                    checked={settings.showBalance}
                    onCheckedChange={(checked) => setSettings({ ...settings, showBalance: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {securityFeatures.map((feature, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      feature.enabled ? "bg-green-100 dark:bg-green-900" : "bg-slate-100 dark:bg-slate-700"
                    }`}>
                      <feature.icon className={`h-5 w-5 ${feature.color}`} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{feature.title}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{feature.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={feature.enabled}
                    onCheckedChange={feature.onToggle}
                  />
                </div>
              ))}

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-slate-900 dark:text-white">Active Sessions</h4>
                {activeSessions === undefined ? (
                  <LoadingSpinner size="md" text="Loading sessions..." className="py-4" />
                ) : (
                  <div className="space-y-3">
                    {activeSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <Lock className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{session.device}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              {session.location} • {session.ipAddress}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Last active: {new Date(session.lastActive).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {session.isCurrent && (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              Current
                            </Badge>
                          )}
                          {!session.isCurrent && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRevokeSession(session.id)}
                            >
                              Revoke
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-slate-900 dark:text-white">Change Password</h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button onClick={handleChangePassword} className="bg-blue-600 hover:bg-blue-700">
                    <Key className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="profileVisibility">Profile Visibility</Label>
                  <Select 
                    value={settings.profileVisibility} 
                    onValueChange={(value) => setSettings({ ...settings, profileVisibility: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dataSharing">Data Sharing</Label>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Allow sharing of anonymized data for research
                    </p>
                  </div>
                  <Switch
                    id="dataSharing"
                    checked={settings.dataSharing}
                    onCheckedChange={(checked) => setSettings({ ...settings, dataSharing: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="analytics">Analytics</Label>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Help improve our service with usage analytics
                    </p>
                  </div>
                  <Switch
                    id="analytics"
                    checked={settings.analytics}
                    onCheckedChange={(checked) => setSettings({ ...settings, analytics: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display" className="space-y-6">
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center">
                <SettingsIcon className="mr-2 h-5 w-5" />
                Display Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select 
                    value={settings.theme} 
                    onValueChange={(value) => setSettings({ ...settings, theme: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center space-x-2">
                          <Sun className="h-4 w-4" />
                          <span>Light</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center space-x-2">
                          <Moon className="h-4 w-4" />
                          <span>Dark</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={settings.language} 
                    onValueChange={(value) => setSettings({ ...settings, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={settings.currency} 
                    onValueChange={(value) => setSettings({ ...settings, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={settings.timezone} 
                    onValueChange={(value) => setSettings({ ...settings, timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                      <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                      <SelectItem value="UTC+0">UTC (UTC+0)</SelectItem>
                      <SelectItem value="UTC+1">Central European Time (UTC+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investment" className="space-y-6">
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Investment Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                  <Select 
                    value={settings.riskTolerance} 
                    onValueChange={(value) => setSettings({ ...settings, riskTolerance: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoReinvest">Auto-Reinvest</Label>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Automatically reinvest profits from completed investments
                    </p>
                  </div>
                  <Switch
                    id="autoReinvest"
                    checked={settings.autoReinvest}
                    onCheckedChange={(checked) => setSettings({ ...settings, autoReinvest: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="investmentAlerts">Investment Alerts</Label>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Get notified about investment opportunities and updates
                    </p>
                  </div>
                  <Switch
                    id="investmentAlerts"
                    checked={settings.investmentAlerts}
                    onCheckedChange={(checked) => setSettings({ ...settings, investmentAlerts: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
