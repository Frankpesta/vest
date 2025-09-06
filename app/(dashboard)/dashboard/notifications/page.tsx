"use client"

import { useState } from "react"
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
  Archive
} from "lucide-react"
import { useNotificationStore } from "@/lib/store"
import { toast } from "sonner"

const mockNotifications = [
  {
    id: 1,
    type: "investment",
    title: "Investment Matured",
    message: "Your investment in 'Crypto Staking Pool' has matured and generated 12.5% returns.",
    timestamp: "2 hours ago",
    read: false,
    priority: "high",
    icon: TrendingUp,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900",
  },
  {
    id: 2,
    type: "deposit",
    title: "Deposit Confirmed",
    message: "Your deposit of 2.5 ETH has been confirmed and added to your account balance.",
    timestamp: "4 hours ago",
    read: false,
    priority: "medium",
    icon: DollarSign,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900",
  },
  {
    id: 3,
    type: "security",
    title: "New Login Detected",
    message: "We detected a new login from an unrecognized device. If this wasn't you, please secure your account.",
    timestamp: "1 day ago",
    read: true,
    priority: "high",
    icon: Shield,
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900",
  },
  {
    id: 4,
    type: "system",
    title: "Maintenance Scheduled",
    message: "Scheduled maintenance will occur on Dec 20, 2024 from 2:00 AM to 4:00 AM UTC.",
    timestamp: "2 days ago",
    read: true,
    priority: "low",
    icon: Info,
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-900",
  },
  {
    id: 5,
    type: "investment",
    title: "New Investment Opportunity",
    message: "A new high-yield investment plan is now available. Expected returns up to 18% APY.",
    timestamp: "3 days ago",
    read: true,
    priority: "medium",
    icon: TrendingUp,
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900",
  },
  {
    id: 6,
    type: "withdrawal",
    title: "Withdrawal Processed",
    message: "Your withdrawal of 1.2 ETH has been processed and sent to your external wallet.",
    timestamp: "5 days ago",
    read: true,
    priority: "medium",
    icon: DollarSign,
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900",
  },
]

const notificationTypes = [
  { value: "all", label: "All Notifications", count: mockNotifications.length },
  { value: "unread", label: "Unread", count: mockNotifications.filter(n => !n.read).length },
  { value: "investment", label: "Investments", count: mockNotifications.filter(n => n.type === "investment").length },
  { value: "deposit", label: "Deposits", count: mockNotifications.filter(n => n.type === "deposit").length },
  { value: "withdrawal", label: "Withdrawals", count: mockNotifications.filter(n => n.type === "withdrawal").length },
  { value: "security", label: "Security", count: mockNotifications.filter(n => n.type === "security").length },
  { value: "system", label: "System", count: mockNotifications.filter(n => n.type === "system").length },
]

const notificationSettings = [
  {
    category: "Investment Notifications",
    settings: [
      {
        name: "Investment Maturity",
        description: "Notify when investments mature or generate returns",
        enabled: true,
        type: "email",
      },
      {
        name: "New Opportunities",
        description: "Alert about new investment opportunities",
        enabled: true,
        type: "push",
      },
      {
        name: "Portfolio Updates",
        description: "Weekly portfolio performance updates",
        enabled: false,
        type: "email",
      },
    ],
  },
  {
    category: "Transaction Notifications",
    settings: [
      {
        name: "Deposit Confirmations",
        description: "Notify when deposits are confirmed",
        enabled: true,
        type: "both",
      },
      {
        name: "Withdrawal Updates",
        description: "Alert about withdrawal status changes",
        enabled: true,
        type: "both",
      },
      {
        name: "Transaction Failures",
        description: "Notify about failed transactions",
        enabled: true,
        type: "both",
      },
    ],
  },
  {
    category: "Security Notifications",
    settings: [
      {
        name: "Login Alerts",
        description: "Alert about new login attempts",
        enabled: true,
        type: "both",
      },
      {
        name: "Password Changes",
        description: "Notify when password is changed",
        enabled: true,
        type: "email",
      },
      {
        name: "Suspicious Activity",
        description: "Alert about suspicious account activity",
        enabled: true,
        type: "both",
      },
    ],
  },
]

export default function NotificationsPage() {
  const { unreadCount, markAllAsRead } = useNotificationStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [notifications, setNotifications] = useState(mockNotifications)

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || notification.type === selectedType
    return matchesSearch && matchesType
  })

  const handleMarkAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
    toast.success("Notification marked as read")
  }

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
    markAllAsRead()
    toast.success("All notifications marked as read")
  }

  const handleDeleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id))
    toast.success("Notification deleted")
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
              {unreadCount} Unread
            </Badge>
            <Button onClick={handleMarkAllAsRead} variant="outline">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark All Read
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
                onClick={() => setSelectedType(type.value)}
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
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-300">No notifications found</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start space-x-4 p-4 rounded-lg border ${
                        notification.read 
                          ? "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50" 
                          : "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notification.bgColor}`}>
                        <notification.icon className={`h-5 w-5 ${notification.color}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-slate-900 dark:text-white">
                            {notification.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {getPriorityBadge(notification.priority)}
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {notification.timestamp}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNotification(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
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
              {notificationSettings.map((category, categoryIndex) => (
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
                          onCheckedChange={(checked) => {
                            // Handle setting toggle
                            toast.success(`${setting.name} ${checked ? 'enabled' : 'disabled'}`)
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
