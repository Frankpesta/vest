import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Create a new notification
export const createNotification = mutation({
  args: {
    userId: v.string(),
    type: v.union(
      v.literal("login"),
      v.literal("register"),
      v.literal("deposit"),
      v.literal("withdrawal"),
      v.literal("investment"),
      v.literal("investment_completion"),
      v.literal("balance_addition"),
      v.literal("kyc"),
      v.literal("kyc_update"),
      v.literal("kyc_approved"),
      v.literal("kyc_rejected"),
      v.literal("password_reset"),
      v.literal("email_verification"),
      v.literal("transaction_status"),
      v.literal("security"),
      v.literal("system"),
      v.literal("marketing"),
      v.literal("admin_action")
    ),
    title: v.string(),
    message: v.string(),
    priority: v.union(v.literal("low"), v.literal("normal"), v.literal("high"), v.literal("urgent")),
    actionUrl: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      ...args,
      isRead: false,
      emailSent: false,
      createdAt: Date.now(),
    });

    // Queue email for this notification
    await ctx.db.insert("emailQueue", {
      to: "", // Will be populated by email service
      subject: args.title,
      htmlContent: "", // Will be populated by email service
      textContent: args.message,
      priority: args.priority,
      status: "pending",
      retryCount: 0,
      maxRetries: 3,
      notificationId,
      createdAt: Date.now(),
    });

    return notificationId;
  },
});

// Get notifications for a user
export const getUserNotifications = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, limit = 50, unreadOnly = false } = args;
    
    let query = ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    if (unreadOnly) {
      query = ctx.db
        .query("notifications")
        .withIndex("by_user_read", (q) => q.eq("userId", userId).eq("isRead", false));
    }

    const notifications = await query
      .order("desc")
      .take(limit);

    return notifications;
  },
});

// Get unread notification count
export const getUnreadCount = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", args.userId).eq("isRead", false))
      .collect();

    return notifications.length;
  },
});

// Mark notification as read
export const markAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      isRead: true,
      readAt: Date.now(),
    });
  },
});

// Mark all notifications as read for a user
export const markAllAsRead = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", args.userId).eq("isRead", false))
      .collect();

    const now = Date.now();
    await Promise.all(
      notifications.map(notification =>
        ctx.db.patch(notification._id, {
          isRead: true,
          readAt: now,
        })
      )
    );
  },
});

// Delete notification
export const deleteNotification = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.notificationId);
  },
});

// Get notifications by type
export const getNotificationsByType = query({
  args: {
    userId: v.string(),
    type: v.union(
      v.literal("login"),
      v.literal("register"),
      v.literal("deposit"),
      v.literal("withdrawal"),
      v.literal("investment"),
      v.literal("investment_completion"),
      v.literal("balance_addition"),
      v.literal("kyc"),
      v.literal("kyc_update"),
      v.literal("kyc_approved"),
      v.literal("kyc_rejected"),
      v.literal("password_reset"),
      v.literal("email_verification"),
      v.literal("transaction_status"),
      v.literal("security"),
      v.literal("system"),
      v.literal("marketing"),
      v.literal("admin_action")
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("type"), args.type))
      .order("desc")
      .take(args.limit || 20);

    return notifications;
  },
});

// Admin: Get all notifications
export const getAllNotifications = query({
  args: {
    limit: v.optional(v.number()),
    type: v.optional(v.union(
      v.literal("login"),
      v.literal("register"),
      v.literal("deposit"),
      v.literal("withdrawal"),
      v.literal("investment"),
      v.literal("investment_completion"),
      v.literal("balance_addition"),
      v.literal("kyc"),
      v.literal("kyc_update"),
      v.literal("kyc_approved"),
      v.literal("kyc_rejected"),
      v.literal("password_reset"),
      v.literal("email_verification"),
      v.literal("transaction_status"),
      v.literal("security"),
      v.literal("system"),
      v.literal("marketing"),
      v.literal("admin_action")
    )),
  },
  handler: async (ctx, args) => {
    let notifications;
    
    if (args.type) {
      notifications = await ctx.db
        .query("notifications")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .order("desc")
        .take(args.limit || 100);
    } else {
      notifications = await ctx.db
        .query("notifications")
        .order("desc")
        .take(args.limit || 100);
    }

    return notifications;
  },
});

// Update notification email status
export const updateEmailStatus = mutation({
  args: {
    notificationId: v.id("notifications"),
    emailSent: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      emailSent: args.emailSent,
      emailSentAt: args.emailSent ? Date.now() : undefined,
    });
  },
});

// Get notification statistics
export const getNotificationStats = query({
  args: {},
  handler: async (ctx) => {
    const allNotifications = await ctx.db.query("notifications").collect();
    
    const stats = {
      total: allNotifications.length,
      unread: allNotifications.filter(n => !n.isRead).length,
      read: allNotifications.filter(n => n.isRead).length,
      byType: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
    };

    // Count by type
    allNotifications.forEach(notification => {
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
    });

    // Count by priority
    allNotifications.forEach(notification => {
      stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1;
    });

    return stats;
  },
});