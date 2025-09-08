import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { betterAuthComponent } from "./auth";

// Get user's notifications
export const getUserNotifications = query({
  args: {
    type: v.optional(v.union(
      v.literal("investment"),
      v.literal("deposit"),
      v.literal("withdrawal"),
      v.literal("security"),
      v.literal("system"),
      v.literal("marketing")
    )),
    unreadOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      return [];
    }

    let query = ctx.db.query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userMetadata.userId!));

    if (args.unreadOnly) {
      query = query.filter((q) => q.eq(q.field("isRead"), false));
    }

    if (args.type) {
      query = query.filter((q) => q.eq(q.field("type"), args.type));
    }

    const limit = args.limit || 50;
    return await query
      .order("desc")
      .take(limit);
  },
});

// Get unread notification count
export const getUnreadNotificationCount = query({
  args: {},
  handler: async (ctx) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      return 0;
    }

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userMetadata.userId!))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    return unreadNotifications.length;
  },
});

// Mark notification as read
export const markNotificationAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      throw new Error("Not authenticated");
    }

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== userMetadata.userId) {
      throw new Error("Notification not found");
    }

    await ctx.db.patch(args.notificationId, {
      isRead: true,
      readAt: Date.now(),
    });

    return { success: true };
  },
});

// Mark all notifications as read
export const markAllNotificationsAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      throw new Error("Not authenticated");
    }

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userMetadata.userId!))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    const now = Date.now();
    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, {
        isRead: true,
        readAt: now,
      });
    }

    return { success: true, markedCount: unreadNotifications.length };
  },
});

// Delete notification
export const deleteNotification = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      throw new Error("Not authenticated");
    }

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== userMetadata.userId) {
      throw new Error("Notification not found");
    }

    await ctx.db.delete(args.notificationId);
    return { success: true };
  },
});

// Delete all read notifications
export const deleteAllReadNotifications = mutation({
  args: {},
  handler: async (ctx) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      throw new Error("Not authenticated");
    }

    const readNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userMetadata.userId!))
      .filter((q) => q.eq(q.field("isRead"), true))
      .collect();

    for (const notification of readNotifications) {
      await ctx.db.delete(notification._id);
    }

    return { success: true, deletedCount: readNotifications.length };
  },
});

// Get notification settings (for future use)
export const getNotificationSettings = query({
  args: {},
  handler: async (ctx) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      return null;
    }

    // For now, return default settings
    // In the future, this could be stored in userProfiles or a separate settings table
    return {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      investmentAlerts: true,
      depositAlerts: true,
      withdrawalAlerts: true,
      securityAlerts: true,
      marketingEmails: false,
    };
  },
});

// Update notification settings (for future use)
export const updateNotificationSettings = mutation({
  args: {
    emailNotifications: v.optional(v.boolean()),
    pushNotifications: v.optional(v.boolean()),
    smsNotifications: v.optional(v.boolean()),
    investmentAlerts: v.optional(v.boolean()),
    depositAlerts: v.optional(v.boolean()),
    withdrawalAlerts: v.optional(v.boolean()),
    securityAlerts: v.optional(v.boolean()),
    marketingEmails: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      throw new Error("Not authenticated");
    }

    // For now, just return success
    // In the future, this would update user settings in the database
    return { success: true };
  },
});
