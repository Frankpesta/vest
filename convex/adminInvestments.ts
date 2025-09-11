import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { betterAuthComponent } from "./auth";

// Get all investments (admin only)
export const getAllInvestments = query({
  args: {
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("cancelled")
    )),
    planId: v.optional(v.id("investmentPlans")),
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

    const limit = args.limit || 100;
    let investments;

    if (args.status) {
      investments = await ctx.db
        .query("investments")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(limit);
    } else if (args.planId) {
      investments = await ctx.db
        .query("investments")
        .withIndex("by_plan", (q) => q.eq("planId", args.planId!))
        .order("desc")
        .take(limit);
    } else {
      investments = await ctx.db
        .query("investments")
        .withIndex("by_created_at")
        .order("desc")
        .take(limit);
    }

    // Get plan details and user info for each investment
    const investmentsWithDetails = await Promise.all(
      investments.map(async (investment) => {
        const plan = await ctx.db.get(investment.planId);
        const userProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user_id", (q) => q.eq("userId", investment.userId))
          .first();
        
        return {
          ...investment,
          plan,
          userProfile,
        };
      })
    );

    return investmentsWithDetails;
  },
});

// Get investment statistics (admin only)
export const getInvestmentStats = query({
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

    const allInvestments = await ctx.db.query("investments").collect();
    
    const stats = {
      total: allInvestments.length,
      pending: allInvestments.filter(i => i.status === "pending").length,
      active: allInvestments.filter(i => i.status === "active").length,
      paused: allInvestments.filter(i => i.status === "paused").length,
      completed: allInvestments.filter(i => i.status === "completed").length,
      cancelled: allInvestments.filter(i => i.status === "cancelled").length,
      totalInvested: allInvestments.reduce((sum, i) => sum + (i.amount || 0), 0),
      totalReturns: allInvestments.reduce((sum, i) => sum + (i.totalReturn || 0), 0),
    };

    // Get recent investments (last 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentInvestments = allInvestments.filter(i => i.createdAt > sevenDaysAgo).length;

    return {
      ...stats,
      recentInvestments,
    };
  },
});

// Update investment status (admin only)
export const updateInvestmentStatus = mutation({
  args: {
    investmentId: v.id("investments"),
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    adminNotes: v.optional(v.string()),
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

    const investment = await ctx.db.get(args.investmentId);
    if (!investment) {
      throw new Error("Investment not found");
    }

    const now = Date.now();
    const updateData: any = {
      status: args.status,
      updatedAt: now,
    };

    if (args.adminNotes) {
      updateData.adminNotes = args.adminNotes;
    }

    await ctx.db.patch(args.investmentId, updateData);

    // Create notification for user
    await ctx.db.insert("notifications", {
      userId: investment.userId,
      type: "investment",
      title: `Investment ${args.status.charAt(0).toUpperCase() + args.status.slice(1)}`,
      message: `Your investment has been ${args.status}.`,
      priority: args.status === "cancelled" ? "high" : "normal",
      isRead: false,
      emailSent: false,
      metadata: {
        investmentId: args.investmentId,
        status: args.status,
      },
      createdAt: now,
    });

    return { success: true };
  },
});

// Get investment performance data (admin only)
export const getInvestmentPerformanceData = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
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

    const days = args.days || 30;
    const startDate = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    const investments = await ctx.db
      .query("investments")
      .withIndex("by_created_at")
      .filter((q) => q.gte(q.field("createdAt"), startDate))
      .collect();

    // Group by day
    const dailyData = investments.reduce((acc, investment) => {
      const date = new Date(investment.createdAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, count: 0, totalAmount: 0 };
      }
      acc[date].count += 1;
      acc[date].totalAmount += investment.amount || 0;
      return acc;
    }, {} as Record<string, { date: string; count: number; totalAmount: number }>);

    return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
  },
});
