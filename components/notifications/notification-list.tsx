"use client";

import { useState } from "react";
import { 
  Check, 
  CheckCheck, 
  Trash2, 
  ExternalLink,
  Bell,
  BellOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthStore } from "@/lib/store";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface NotificationListProps {
  onClose: () => void;
}

export function NotificationList({ onClose }: NotificationListProps) {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const notifications = useQuery(api.notifications.getUserNotifications, 
    user ? { userId: user.id, limit: 20 } : "skip"
  );
  
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const deleteNotification = useMutation(api.notifications.deleteNotification);

  if (!user) return null;

  const handleMarkAsRead = async (notificationId: string) => {
    setIsLoading(true);
    try {
      await markAsRead({ notificationId: notificationId as any });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsLoading(true);
    try {
      await markAllAsRead({ userId: user.id });
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (notificationId: string) => {
    setIsLoading(true);
    try {
      await deleteNotification({ notificationId: notificationId as any });
    } catch (error) {
      console.error("Failed to delete notification:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "login":
        return "🔐";
      case "register":
        return "👋";
      case "deposit":
        return "💰";
      case "withdrawal":
        return "💸";
      case "investment":
        return "📈";
      case "investment_completion":
        return "🎉";
      case "kyc_update":
      case "kyc_approved":
      case "kyc_rejected":
        return "🆔";
      case "password_reset":
        return "🔑";
      case "email_verification":
        return "✉️";
      case "transaction_status":
        return "📊";
      case "security":
        return "🛡️";
      case "system":
        return "⚙️";
      case "marketing":
        return "📢";
      default:
        return "🔔";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (!notifications) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
        <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center">
        <BellOff className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-sm">Notifications</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={isLoading || notifications.every(n => n.isRead)}
            className="h-8 px-2"
          >
            <CheckCheck className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {notifications.map((notification, index) => (
            <div key={notification._id}>
              <div
                className={`p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                  !notification.isRead ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-lg flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </h4>
                      <Badge 
                        variant={getPriorityColor(notification.priority) as any}
                        className="text-xs"
                      >
                        {notification.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification._id)}
                            disabled={isLoading}
                            className="h-6 w-6 p-0"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        
                        {notification.actionUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-6 w-6 p-0"
                          >
                            <Link href={notification.actionUrl}>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(notification._id)}
                          disabled={isLoading}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {index < notifications.length - 1 && (
                <Separator className="my-2" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          asChild
        >
          <Link href="/dashboard/notifications">
            View All Notifications
          </Link>
        </Button>
      </div>
    </div>
  );
}
