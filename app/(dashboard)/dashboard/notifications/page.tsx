"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Bell, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  TrendingUp, 
  DollarSign, 
  Shield, 
  Mail, 
  Smartphone,
  Settings,
  Trash2,
  CheckCircle2,
  Archive,
  Loader2
} from "lucide-react"
import { useNotificationStore } from "@/lib/store"
import { toast } from "sonner"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { LoadingSpinner, LoadingCard } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"

export default function NotificationsPage() {
  const { unreadCount, markAllAsRead } = useNotificationStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [unreadOnly, setUnreadOnly] = useState(false)
  
  // Fetch notifications from backend
  const notifications = useQuery(api.notifications.getUserNotifications, {
    type: selectedType === "all" ? undefined : selectedType as any,
    unreadOnly: unreadOnly,
    limit: 100
  })
  
  const unreadCountBackend = useQuery(api.notifications.getUnreadNotificationCount, {})
  const notificationSettings = useQuery(api.notifications.getNotificationSettings, {})
  
  // Mutations
  const markAsRead = useMutation(api.notifications.markNotificationAsRead)
  const markAllAsReadBackend = useMutation(api.notifications.markAllNotificationsAsRead)
  const deleteNotification = useMutation(api.notifications.deleteNotification)
  const deleteAllRead = useMutation(api.notifications.deleteAllReadNotifications)
  const updateSettings = useMutation(api.notifications.updateNotificationSettings)

  // Update unread count in store when backend data changes
  useEffect(() => {
    if (unreadCountBackend !== undefined) {
      // Update the store with real unread count
      // This is a simplified approach - in a real app you might want to sync this properly
    }
  }, [unreadCountBackend])

  const filteredNotifications = notifications?.filter((notification) => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  }) || []

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead({ notificationId: notificationId as any })
      toast.success("Notification marked as read")
    } catch (error) {
      toast.error("Failed to mark notification as read")
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadBackend({})
      markAllAsRead() // Update local store
      toast.success("All notifications marked as read")
    } catch (error) {
      toast.error("Failed to mark all notifications as read")
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification({ notificationId: notificationId as any })
      toast.success("Notification deleted")
    } catch (error) {
      toast.error("Failed to delete notification")
    }
  }

  const handleDeleteAllRead = async () => {
    try {
      await deleteAllRead({})
      toast.success("All read notifications deleted")
    } catch (error) {
      toast.error("Failed to delete read notifications")
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Medium</Badge>
      case "low":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Low</Badge>
      default:
        return null
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "investment":
        return { icon: TrendingUp, color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900" }
      case "deposit":
        return { icon: DollarSign, color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900" }
      case "withdrawal":
        return { icon: DollarSign, color: "text-orange-600", bgColor: "bg-orange-100 dark:bg-orange-900" }
      case "security":
        return { icon: Shield, color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-900" }
      case "system":
        return { icon: Info, color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-900" }
      case "marketing":
        return { icon: Bell, color: "text-purple-600", bgColor: "bg-purple-100 dark:bg-purple-900" }
      default:
        return { icon: Bell, color: "text-slate-600", bgColor: "bg-slate-100 dark:bg-slate-700" }
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    } else {
      return `${days} day${days !== 1 ? 's' : ''} ago`
    }
  }

  const notificationTypes = [
    { value: "all", label: "All Notifications", count: notifications?.length || 0 },
    { value: "unread", label: "Unread", count: unreadCountBackend || 0 },
    { value: "investment", label: "Investments", count: notifications?.filter(n => n.type === "investment").length || 0 },
    { value: "deposit", label: "Deposits", count: notifications?.filter(n => n.type === "deposit").length || 0 },
    { value: "withdrawal", label: "Withdrawals", count: notifications?.filter(n => n.type === "withdrawal").length || 0 },
    { value: "security", label: "Security", count: notifications?.filter(n => n.type === "security").length || 0 },
    { value: "system", label: "System", count: notifications?.filter(n => n.type === "system").length || 0 },
  ]

  const notificationSettingsData = [
    {
      category: "Investment Notifications",
      settings: [
        {
          name: "Investment Maturity",
          description: "Notify when investments mature or generate returns",
          enabled: notificationSettings?.investmentAlerts ?? true,
          type: "email",
          key: "investmentAlerts"
        },
        {
          name: "New Opportunities",
          description: "Alert about new investment opportunities",
          enabled: notificationSettings?.investmentAlerts ?? true,
          type: "push",
          key: "investmentAlerts"
        },
        {
          name: "Portfolio Updates",
          description: "Weekly portfolio performance updates",
          enabled: notificationSettings?.investmentAlerts ?? false,
          type: "email",
          key: "investmentAlerts"
        },
      ],
    },
    {
      category: "Transaction Notifications",
      settings: [
        {
          name: "Deposit Confirmations",
          description: "Notify when deposits are confirmed",
          enabled: notificationSettings?.depositAlerts ?? true,
          type: "both",
          key: "depositAlerts"
        },
        {
          name: "Withdrawal Updates",
          description: "Alert about withdrawal status changes",
          enabled: notificationSettings?.withdrawalAlerts ?? true,
          type: "both",
          key: "withdrawalAlerts"
        },
        {
          name: "Transaction Failures",
          description: "Notify about failed transactions",
          enabled: notificationSettings?.emailNotifications ?? true,
          type: "both",
          key: "emailNotifications"
        },
      ],
    },
    {
      category: "Security Notifications",
      settings: [
        {
          name: "Login Alerts",
          description: "Alert about new login attempts",
          enabled: notificationSettings?.securityAlerts ?? true,
          type: "both",
          key: "securityAlerts"
        },
        {
          name: "Password Changes",
          description: "Notify when password is changed",
          enabled: notificationSettings?.emailNotifications ?? true,
          type: "email",
          key: "emailNotifications"
        },
        {
          name: "Suspicious Activity",
          description: "Alert about suspicious account activity",
          enabled: notificationSettings?.securityAlerts ?? true,
          type: "both",
          key: "securityAlerts"
        },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Notifications</h1>
            <p className="text-slate-600 dark:text-slate-300">Stay updated with your investment activities</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {unreadCountBackend || 0} Unread
            </Badge>
            <Button onClick={handleMarkAllAsRead} variant="outline" disabled={!notifications?.length}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark All Read
            </Button>
            <Button onClick={handleDeleteAllRead} variant="outline" disabled={!notifications?.filter(n => n.isRead).length}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Read
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex space-x-2">
            {notificationTypes.slice(0, 4).map((type) => (
              <Button
                key={type.value}
                variant={selectedType === type.value ? "default" : "outline"}
                onClick={() => {
                  setSelectedType(type.value)
                  setUnreadOnly(type.value === "unread")
                }}
                className="relative"
              >
                {type.label}
                {type.count > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white text-xs">
                    {type.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle>All Notifications ({filteredNotifications.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications === undefined ? (
                  <LoadingSpinner size="lg" text="Loading notifications..." className="py-8" />
                ) : filteredNotifications.length === 0 ? (
                  <EmptyState
                    icon={Bell}
                    title="No notifications found"
                    description="Your notifications will appear here when you have activity on your account."
                  />
                ) : (
                  filteredNotifications.map((notification) => {
                    const iconData = getNotificationIcon(notification.type)
                    const IconComponent = iconData.icon
                    
                    return (
                      <div
                        key={notification._id}
                        className={`flex items-start space-x-4 p-4 rounded-lg border ${
                          notification.isRead 
                            ? "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50" 
                            : "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconData.bgColor}`}>
                          <IconComponent className={`h-5 w-5 ${iconData.color}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-slate-900 dark:text-white">
                              {notification.title}
                            </h3>
                            <div className="flex items-center space-x-2">
                              {getPriorityBadge(notification.priority)}
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formatTimestamp(notification.createdAt)}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification._id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNotification(notification._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {notificationSettings === undefined ? (
                <LoadingSpinner size="lg" text="Loading settings..." className="py-8" />
              ) : (
                <>
                  {notificationSettingsData.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="space-y-4">
                      <h4 className="font-medium text-slate-900 dark:text-white text-lg">
                        {category.category}
                      </h4>
                      <div className="space-y-4">
                        {category.settings.map((setting, settingIndex) => (
                          <div
                            key={settingIndex}
                            className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700"
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-1">
                                <h5 className="font-medium text-slate-900 dark:text-white">
                                  {setting.name}
                                </h5>
                                <div className="flex items-center space-x-2">
                                  {setting.type === "email" && <Mail className="h-4 w-4 text-blue-600" />}
                                  {setting.type === "push" && <Bell className="h-4 w-4 text-green-600" />}
                                  {setting.type === "both" && (
                                    <div className="flex space-x-1">
                                      <Mail className="h-4 w-4 text-blue-600" />
                                      <Bell className="h-4 w-4 text-green-600" />
                                    </div>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-300">
                                {setting.description}
                              </p>
                            </div>
                            <Switch
                              checked={setting.enabled}
                              onCheckedChange={async (checked) => {
                                try {
                                  await updateSettings({ [setting.key]: checked })
                                  toast.success(`${setting.name} ${checked ? 'enabled' : 'disabled'}`)
                                } catch (error) {
                                  toast.error("Failed to update setting")
                                }
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800 dark:text-amber-200">Notification Preferences</p>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                          You can customize notification delivery methods (email, push, or both) for each setting above.
                          Changes are saved automatically.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
