"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Settings, 
  Save,
  RefreshCw,
  Download,
  Upload,
  Database,
  Server,
  Globe,
  Shield,
  Bell,
  Mail,
  Key,
  Lock,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  HardDrive,
  Cpu,
  MemoryStick,
  Wifi,
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
import { Switch } from "@/components/ui/switch"

export default function AdminSystemPage() {
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false)
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false)
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // System settings state
  const [systemSettings, setSystemSettings] = useState({
    // General Settings
    siteName: "CryptVest",
    siteDescription: "Advanced Cryptocurrency Investment Platform",
    siteUrl: "https://cryptvest.com",
    timezone: "UTC",
    language: "en",
    maintenanceMode: false,
    
    // Security Settings
    enableTwoFactor: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    enableIpWhitelist: false,
    
    // Email Settings
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUsername: "",
    smtpPassword: "",
    fromEmail: "noreply@cryptvest.com",
    fromName: "CryptVest",
    
    // Notification Settings
    enableEmailNotifications: true,
    enablePushNotifications: true,
    enableSmsNotifications: false,
    
    // Investment Settings
    minInvestmentAmount: 100,
    maxInvestmentAmount: 1000000,
    defaultInvestmentPlan: "basic",
    enableAutoInvest: false,
    
    // Withdrawal Settings
    minWithdrawalAmount: 50,
    maxWithdrawalAmount: 100000,
    withdrawalProcessingTime: 24,
    enableAutoWithdrawal: false,
  })

  // System status data (mock data in a real app, this would come from the backend)
  const systemStatus = {
    uptime: "99.9%",
    responseTime: "120ms",
    cpuUsage: 45,
    memoryUsage: 68,
    diskUsage: 32,
    databaseStatus: "healthy",
    lastBackup: Date.now() - 1000 * 60 * 60 * 6, // 6 hours ago
    version: "1.2.3",
    environment: "production",
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      // In a real app, this would call a backend mutation
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success("Settings saved successfully")
    } catch (error) {
      toast.error("Failed to save settings")
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRestartSystem = async () => {
    try {
      // In a real app, this would call a backend mutation
      toast.success("System restart initiated")
      setIsRestartModalOpen(false)
    } catch (error) {
      toast.error("Failed to restart system")
      console.error(error)
    }
  }

  const handleCreateBackup = async () => {
    try {
      // In a real app, this would call a backend mutation
      toast.success("Backup created successfully")
      setIsBackupModalOpen(false)
    } catch (error) {
      toast.error("Failed to create backup")
      console.error(error)
    }
  }

  const handleToggleMaintenance = async () => {
    try {
      setSystemSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))
      toast.success(`Maintenance mode ${systemSettings.maintenanceMode ? 'disabled' : 'enabled'}`)
    } catch (error) {
      toast.error("Failed to toggle maintenance mode")
      console.error(error)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "error":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">System Settings</h1>
          <p className="text-slate-600 dark:text-slate-300">Configure system settings and monitor platform health</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Settings
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">System Uptime</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{systemStatus.uptime}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Response Time</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{systemStatus.responseTime}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">CPU Usage</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{systemStatus.cpuUsage}%</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Cpu className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Memory Usage</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{systemStatus.memoryUsage}%</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <MemoryStick className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="investment">Investment</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={systemSettings.siteName}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, siteName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    value={systemSettings.siteUrl}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, siteUrl: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={systemSettings.timezone} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, timezone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Time</SelectItem>
                      <SelectItem value="PST">Pacific Time</SelectItem>
                      <SelectItem value="GMT">GMT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={systemSettings.language} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, language: value }))}>
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
              </div>
              <div>
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={systemSettings.siteDescription}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableTwoFactor">Enable Two-Factor Authentication</Label>
                    <p className="text-sm text-slate-500">Require 2FA for all admin accounts</p>
                  </div>
                  <Switch
                    id="enableTwoFactor"
                    checked={systemSettings.enableTwoFactor}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, enableTwoFactor: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableIpWhitelist">Enable IP Whitelist</Label>
                    <p className="text-sm text-slate-500">Restrict admin access to specific IP addresses</p>
                  </div>
                  <Switch
                    id="enableIpWhitelist"
                    checked={systemSettings.enableIpWhitelist}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, enableIpWhitelist: checked }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={systemSettings.sessionTimeout}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={systemSettings.maxLoginAttempts}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={systemSettings.passwordMinLength}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={systemSettings.smtpHost}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={systemSettings.smtpPort}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="smtpUsername">SMTP Username</Label>
                  <Input
                    id="smtpUsername"
                    value={systemSettings.smtpUsername}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, smtpUsername: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={systemSettings.smtpPassword}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={systemSettings.fromEmail}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={systemSettings.fromName}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, fromName: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableEmailNotifications">Enable Email Notifications</Label>
                    <p className="text-sm text-slate-500">Send notifications via email</p>
                  </div>
                  <Switch
                    id="enableEmailNotifications"
                    checked={systemSettings.enableEmailNotifications}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, enableEmailNotifications: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enablePushNotifications">Enable Push Notifications</Label>
                    <p className="text-sm text-slate-500">Send push notifications to users</p>
                  </div>
                  <Switch
                    id="enablePushNotifications"
                    checked={systemSettings.enablePushNotifications}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, enablePushNotifications: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableSmsNotifications">Enable SMS Notifications</Label>
                    <p className="text-sm text-slate-500">Send notifications via SMS</p>
                  </div>
                  <Switch
                    id="enableSmsNotifications"
                    checked={systemSettings.enableSmsNotifications}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, enableSmsNotifications: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investment" className="space-y-4">
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle>Investment Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minInvestmentAmount">Minimum Investment Amount ($)</Label>
                  <Input
                    id="minInvestmentAmount"
                    type="number"
                    value={systemSettings.minInvestmentAmount}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, minInvestmentAmount: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxInvestmentAmount">Maximum Investment Amount ($)</Label>
                  <Input
                    id="maxInvestmentAmount"
                    type="number"
                    value={systemSettings.maxInvestmentAmount}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, maxInvestmentAmount: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="defaultInvestmentPlan">Default Investment Plan</Label>
                  <Select value={systemSettings.defaultInvestmentPlan} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, defaultInvestmentPlan: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableAutoInvest">Enable Auto-Investment</Label>
                  <p className="text-sm text-slate-500">Allow automatic investment processing</p>
                </div>
                <Switch
                  id="enableAutoInvest"
                  checked={systemSettings.enableAutoInvest}
                  onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, enableAutoInvest: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle>System Maintenance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    <p className="text-sm text-slate-500">Put the system in maintenance mode</p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={systemSettings.maintenanceMode}
                    onCheckedChange={handleToggleMaintenance}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minWithdrawalAmount">Minimum Withdrawal Amount ($)</Label>
                  <Input
                    id="minWithdrawalAmount"
                    type="number"
                    value={systemSettings.minWithdrawalAmount}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, minWithdrawalAmount: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxWithdrawalAmount">Maximum Withdrawal Amount ($)</Label>
                  <Input
                    id="maxWithdrawalAmount"
                    type="number"
                    value={systemSettings.maxWithdrawalAmount}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, maxWithdrawalAmount: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="withdrawalProcessingTime">Withdrawal Processing Time (hours)</Label>
                  <Input
                    id="withdrawalProcessingTime"
                    type="number"
                    value={systemSettings.withdrawalProcessingTime}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, withdrawalProcessingTime: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableAutoWithdrawal">Enable Auto-Withdrawal</Label>
                  <p className="text-sm text-slate-500">Allow automatic withdrawal processing</p>
                </div>
                <Switch
                  id="enableAutoWithdrawal"
                  checked={systemSettings.enableAutoWithdrawal}
                  onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, enableAutoWithdrawal: checked }))}
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">System Actions</h3>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsBackupModalOpen(true)}
                    className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Create Backup
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsRestartModalOpen(true)}
                    className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Restart System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Status Card */}
      <Card className="bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              {getStatusIcon(systemStatus.databaseStatus)}
              <div>
                <p className="text-sm font-medium">Database</p>
                <p className={`text-sm ${getStatusColor(systemStatus.databaseStatus)}`}>
                  {systemStatus.databaseStatus}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <HardDrive className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Disk Usage</p>
                <p className="text-sm text-slate-600">{systemStatus.diskUsage}%</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Last Backup</p>
                <p className="text-sm text-slate-600">{formatDate(systemStatus.lastBackup)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Settings className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Version</p>
                <p className="text-sm text-slate-600">{systemStatus.version}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Restart System Modal */}
      <AlertDialog open={isRestartModalOpen} onOpenChange={setIsRestartModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restart System</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restart the system? This will cause temporary downtime and may affect active users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestartSystem}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Restart System
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Backup Modal */}
      <AlertDialog open={isBackupModalOpen} onOpenChange={setIsBackupModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create System Backup</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a complete backup of the system including all data and configurations. The process may take several minutes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCreateBackup}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Backup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
