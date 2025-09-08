import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { betterAuthComponent } from "./auth";

// Generate unique ticket number
const generateTicketNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `TKT-${timestamp}-${random}`;
};

// Get user's support tickets
export const getUserSupportTickets = query({
  args: {
    status: v.optional(v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("waiting_for_user"),
      v.literal("resolved"),
      v.literal("closed")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      return [];
    }

    let query = ctx.db.query("supportTickets")
      .withIndex("by_user", (q) => q.eq("userId", userMetadata.userId!));

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const limit = args.limit || 50;
    return await query
      .order("desc")
      .take(limit);
  },
});

// Get support ticket by ID
export const getSupportTicketById = query({
  args: { ticketId: v.id("supportTickets") },
  handler: async (ctx, args) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      return null;
    }

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket || ticket.userId !== userMetadata.userId) {
      return null;
    }

    // Get messages for this ticket
    const messages = await ctx.db
      .query("supportMessages")
      .withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId))
      .order("asc")
      .collect();

    return {
      ...ticket,
      messages,
    };
  },
});

// Create new support ticket
export const createSupportTicket = mutation({
  args: {
    subject: v.string(),
    category: v.union(
      v.literal("investment"),
      v.literal("transaction"),
      v.literal("account"),
      v.literal("technical"),
      v.literal("billing"),
      v.literal("other")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    description: v.string(),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    const ticketNumber = generateTicketNumber();

    // Create the support ticket
    const ticketId = await ctx.db.insert("supportTickets", {
      userId: userMetadata.userId,
      ticketNumber,
      subject: args.subject,
      category: args.category,
      priority: args.priority,
      status: "open",
      description: args.description,
      attachments: args.attachments,
      createdAt: now,
      updatedAt: now,
    });

    // Create initial message
    await ctx.db.insert("supportMessages", {
      ticketId,
      userId: userMetadata.userId,
      message: args.description,
      isFromAdmin: false,
      attachments: args.attachments,
      createdAt: now,
    });

    // Create notification for admin
    await ctx.db.insert("notifications", {
      userId: userMetadata.userId,
      type: "system",
      title: "Support Ticket Created",
      message: `Your support ticket #${ticketNumber} has been created and will be reviewed by our team.`,
      priority: "medium",
      isRead: false,
      metadata: {
        ticketId,
        ticketNumber,
        category: args.category,
        priority: args.priority,
      },
      createdAt: now,
    });

    return { ticketId, ticketNumber };
  },
});

// Add message to support ticket
export const addSupportMessage = mutation({
  args: {
    ticketId: v.id("supportTickets"),
    message: v.string(),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      throw new Error("Not authenticated");
    }

    // Verify ticket belongs to user
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket || ticket.userId !== userMetadata.userId) {
      throw new Error("Ticket not found or access denied");
    }

    if (ticket.status === "closed") {
      throw new Error("Cannot add message to closed ticket");
    }

    const now = Date.now();

    // Add message
    await ctx.db.insert("supportMessages", {
      ticketId: args.ticketId,
      userId: userMetadata.userId,
      message: args.message,
      isFromAdmin: false,
      attachments: args.attachments,
      createdAt: now,
    });

    // Update ticket
    await ctx.db.patch(args.ticketId, {
      lastResponseAt: now,
      status: "waiting_for_user",
      updatedAt: now,
    });

    return { success: true };
  },
});

// Update support ticket status (user can only close their own tickets)
export const updateSupportTicketStatus = mutation({
  args: {
    ticketId: v.id("supportTickets"),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("waiting_for_user"),
      v.literal("resolved"),
      v.literal("closed")
    ),
  },
  handler: async (ctx, args) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      throw new Error("Not authenticated");
    }

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket || ticket.userId !== userMetadata.userId) {
      throw new Error("Ticket not found or access denied");
    }

    const now = Date.now();
    const updateData: any = {
      status: args.status,
      updatedAt: now,
    };

    // Set resolved/closed timestamps
    if (args.status === "resolved") {
      updateData.resolvedAt = now;
    } else if (args.status === "closed") {
      updateData.closedAt = now;
    }

    await ctx.db.patch(args.ticketId, updateData);

    return { success: true };
  },
});

// Get all support tickets (admin only)
export const getAllSupportTickets = query({
  args: {
    status: v.optional(v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("waiting_for_user"),
      v.literal("resolved"),
      v.literal("closed")
    )),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    )),
    category: v.optional(v.union(
      v.literal("investment"),
      v.literal("transaction"),
      v.literal("account"),
      v.literal("technical"),
      v.literal("billing"),
      v.literal("other")
    )),
    assignedTo: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if user is admin
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      return [];
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userMetadata.userId!))
      .first();

    if (!userProfile || userProfile.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    let query = ctx.db.query("supportTickets");

    // Apply filters
    if (args.status) {
      query = query.withIndex("by_status", (q) => q.eq("status", args.status));
    } else if (args.priority) {
      query = query.withIndex("by_priority", (q) => q.eq("priority", args.priority));
    } else if (args.category) {
      query = query.withIndex("by_category", (q) => q.eq("category", args.category));
    } else if (args.assignedTo) {
      query = query.withIndex("by_assigned_to", (q) => q.eq("assignedTo", args.assignedTo));
    } else {
      query = query.withIndex("by_created_at");
    }

    const limit = args.limit || 50;
    return await query
      .order("desc")
      .take(limit);
  },
});

// Assign support ticket (admin only)
export const assignSupportTicket = mutation({
  args: {
    ticketId: v.id("supportTickets"),
    assignedTo: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user is admin
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      throw new Error("Not authenticated");
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userMetadata.userId!))
      .first();

    if (!userProfile || userProfile.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    const now = Date.now();
    await ctx.db.patch(args.ticketId, {
      assignedTo: args.assignedTo,
      status: "in_progress",
      updatedAt: now,
    });

    // Create notification for assigned admin
    await ctx.db.insert("notifications", {
      userId: args.assignedTo,
      type: "system",
      title: "Support Ticket Assigned",
      message: `Support ticket #${ticket.ticketNumber} has been assigned to you.`,
      priority: "medium",
      isRead: false,
      metadata: {
        ticketId: args.ticketId,
        ticketNumber: ticket.ticketNumber,
        category: ticket.category,
        priority: ticket.priority,
      },
      createdAt: now,
    });

    return { success: true };
  },
});

// Add admin response to support ticket
export const addAdminResponse = mutation({
  args: {
    ticketId: v.id("supportTickets"),
    message: v.string(),
    attachments: v.optional(v.array(v.string())),
    newStatus: v.optional(v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("waiting_for_user"),
      v.literal("resolved"),
      v.literal("closed")
    )),
  },
  handler: async (ctx, args) => {
    // Check if user is admin
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      throw new Error("Not authenticated");
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userMetadata.userId!))
      .first();

    if (!userProfile || userProfile.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    const now = Date.now();

    // Add admin message
    await ctx.db.insert("supportMessages", {
      ticketId: args.ticketId,
      userId: userMetadata.userId,
      message: args.message,
      isFromAdmin: true,
      attachments: args.attachments,
      createdAt: now,
    });

    // Update ticket
    const updateData: any = {
      lastResponseAt: now,
      updatedAt: now,
    };

    if (args.newStatus) {
      updateData.status = args.newStatus;
      if (args.newStatus === "resolved") {
        updateData.resolvedAt = now;
      } else if (args.newStatus === "closed") {
        updateData.closedAt = now;
      }
    } else {
      updateData.status = "waiting_for_user";
    }

    await ctx.db.patch(args.ticketId, updateData);

    // Create notification for ticket owner
    await ctx.db.insert("notifications", {
      userId: ticket.userId,
      type: "system",
      title: "Support Ticket Update",
      message: `Your support ticket #${ticket.ticketNumber} has been updated with a new response.`,
      priority: "medium",
      isRead: false,
      metadata: {
        ticketId: args.ticketId,
        ticketNumber: ticket.ticketNumber,
        status: updateData.status,
      },
      createdAt: now,
    });

    return { success: true };
  },
});

// Get support ticket statistics (admin only)
export const getSupportTicketStats = query({
  args: {},
  handler: async (ctx) => {
    // Check if user is admin
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      return null;
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userMetadata.userId!))
      .first();

    if (!userProfile || userProfile.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

    // Get all tickets
    const allTickets = await ctx.db.query("supportTickets").collect();

    // Calculate statistics
    const totalTickets = allTickets.length;
    const openTickets = allTickets.filter(t => t.status === "open").length;
    const inProgressTickets = allTickets.filter(t => t.status === "in_progress").length;
    const resolvedTickets = allTickets.filter(t => t.status === "resolved").length;
    const closedTickets = allTickets.filter(t => t.status === "closed").length;

    const recentTickets = allTickets.filter(t => t.createdAt >= oneDayAgo).length;
    const weeklyTickets = allTickets.filter(t => t.createdAt >= oneWeekAgo).length;

    const urgentTickets = allTickets.filter(t => t.priority === "urgent" && t.status !== "closed").length;
    const highPriorityTickets = allTickets.filter(t => t.priority === "high" && t.status !== "closed").length;

    // Calculate average response time (simplified)
    const ticketsWithResponses = allTickets.filter(t => t.lastResponseAt);
    const avgResponseTime = ticketsWithResponses.length > 0 
      ? ticketsWithResponses.reduce((sum, t) => sum + (t.lastResponseAt! - t.createdAt), 0) / ticketsWithResponses.length
      : 0;

    return {
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      recentTickets,
      weeklyTickets,
      urgentTickets,
      highPriorityTickets,
      avgResponseTime: Math.round(avgResponseTime / (60 * 60 * 1000)), // Convert to hours
    };
  },
});
