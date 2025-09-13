import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { betterAuthComponent } from "./auth";

// Get user's investments
export const getUserInvestments = query({
  args: {},
  handler: async (ctx) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      return [];
    }

    const investments = await ctx.db
      .query("investments")
      .withIndex("by_user", (q) => q.eq("userId", userMetadata.userId!))
      .order("desc")
      .collect();

    // Get plan details for each investment
    const investmentsWithPlans = await Promise.all(
      investments.map(async (investment) => {
        const plan = await ctx.db.get(investment.planId);
        return {
          ...investment,
          plan,
        };
      })
    );

    return investmentsWithPlans;
  },
});

// Get user's active investments
export const getActiveInvestments = query({
  args: {},
  handler: async (ctx) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      return [];
    }

    const investments = await ctx.db
      .query("investments")
      .withIndex("by_user_status", (q) => 
        q.eq("userId", userMetadata.userId!).eq("status", "active")
      )
      .order("desc")
      .collect();

    // Get plan details for each investment
    const investmentsWithPlans = await Promise.all(
      investments.map(async (investment) => {
        const plan = await ctx.db.get(investment.planId);
        return {
          ...investment,
          plan,
        };
      })
    );

    return investmentsWithPlans;
  },
});

// Get investment by ID
export const getInvestmentById = query({
  args: { investmentId: v.id("investments") },
  handler: async (ctx, args) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      return null;
    }

    const investment = await ctx.db.get(args.investmentId);
    if (!investment || investment.userId !== userMetadata.userId) {
      return null;
    }

    const plan = await ctx.db.get(investment.planId);
    return {
      ...investment,
      plan,
    };
  },
});

// Create new investment (user)
export const createInvestment = mutation({
  args: {
    planId: v.id("investmentPlans"),
    amount: v.number(), // Amount in USD
    currency: v.string(), // Original currency (ETH, BTC, etc.)
    cryptoAmount: v.number(), // Original crypto amount
    usdValue: v.number(), // USD value at time of investment
    transactionHash: v.string(), // Blockchain transaction hash
    fromAddress: v.string(), // User's wallet address
    toAddress: v.string(), // Company wallet address
    chain: v.string(), // Blockchain network
  },
  handler: async (ctx, args) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      throw new Error("Not authenticated");
    }

    // Get the plan details
    const plan = await ctx.db.get(args.planId);
    if (!plan || !plan.isActive) {
      throw new Error("Investment plan not found or inactive");
    }

    // Validate investment amount
    if (args.usdValue < plan.minInvestment || args.usdValue > plan.maxInvestment) {
      throw new Error(`Investment amount must be between $${plan.minInvestment} and $${plan.maxInvestment}`);
    }

    const now = Date.now();
    const expiresAt = now + (24 * 60 * 60 * 1000); // 24 hours

    // Create pending transaction
    const pendingTxId = await ctx.db.insert("pendingTransactions", {
      userId: userMetadata.userId,
      type: "investment",
      planId: args.planId,
      amount: args.amount,
      currency: args.currency,
      cryptoAmount: args.cryptoAmount,
      usdValue: args.usdValue,
      transactionHash: args.transactionHash,
      confirmations: 0,
      fromAddress: args.fromAddress,
      toAddress: args.toAddress,
      chain: args.chain,
      status: "pending",
      expiresAt,
      createdAt: now,
      updatedAt: now,
    });

    // Create investment record (pending status)
    const investmentId = await ctx.db.insert("investments", {
      userId: userMetadata.userId,
      planId: args.planId,
      amount: args.amount,
      currency: args.currency,
      cryptoAmount: args.cryptoAmount,
      usdValue: args.usdValue,
      expectedReturn: plan.maxAPY, // Use max APY for calculations
      status: "pending",
      transactionHash: args.transactionHash,
      confirmations: 0,
      autoReinvest: false,
      createdAt: now,
      updatedAt: now,
    });

    // Create notification for admin
    await ctx.db.insert("notifications", {
      userId: userMetadata.userId,
      type: "investment",
      title: "Investment Pending",
      message: `Your investment of $${args.usdValue.toLocaleString()} in ${plan.name} is pending admin confirmation.`,
      priority: "normal",
      isRead: false,
      emailSent: false,
      createdAt: now,
      metadata: {
        investmentId,
        pendingTxId,
        planName: plan.name,
      },
    });

    return { investmentId, pendingTxId };
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
      v.literal("cancelled"),
      v.literal("completed"),
      v.literal("failed")
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

    // Handle status-specific logic
    if (args.status === "active" && investment.status === "pending") {
      // Set start date and end date
      const plan = await ctx.db.get(investment.planId);
      if (plan) {
        updateData.startDate = now;
        updateData.endDate = now + (plan.duration * 24 * 60 * 60 * 1000);
        updateData.lastProfitCalculation = now;
      }
    } else if (args.status === "paused") {
      updateData.pausedAt = now;
    } else if (args.status === "cancelled" && investment.status === "paused") {
      // Resume from where it left off
      const pausedDuration = investment.pausedDuration || 0;
      const newPausedDuration = pausedDuration + (now - (investment.pausedAt || now));
      updateData.pausedDuration = newPausedDuration;
      updateData.pausedAt = undefined;
    }

    if (args.adminNotes) {
      updateData.adminNotes = args.adminNotes;
    }

    await ctx.db.patch(args.investmentId, updateData);

    // Create notification for user
    await ctx.db.insert("notifications", {
      userId: investment.userId,
      type: "investment",
      title: `Investment ${args.status.charAt(0).toUpperCase() + args.status.slice(1)}`,
      message: `Your investment has been ${args.status}. ${args.adminNotes || ""}`,
      priority: args.status === "cancelled" ? "high" : "normal",
      isRead: false,
      emailSent: false,
      createdAt: now,
      metadata: {
        investmentId: args.investmentId,
        status: args.status,
      },
    });

    return { success: true };
  },
});

// Pause investment (admin only)
export const pauseInvestment = mutation({
  args: {
    investmentId: v.id("investments"),
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
    await ctx.db.patch(args.investmentId, {
      status: "paused",
      pausedAt: now,
      adminNotes: args.adminNotes,
      updatedAt: now,
    });

    // Create notification for user
    await ctx.db.insert("notifications", {
      userId: investment.userId,
      type: "investment",
      title: "Investment Paused",
      message: `Your investment has been paused. ${args.adminNotes || ""}`,
      priority: "normal",
      isRead: false,
      emailSent: false,
      createdAt: now,
      metadata: {
        investmentId: args.investmentId,
        status: "paused",
      },
    });

    return { success: true };
  },
});

// Resume investment (admin only)
export const resumeInvestment = mutation({
  args: {
    investmentId: v.id("investments"),
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
    const pausedDuration = investment.pausedDuration || 0;
    const newPausedDuration = pausedDuration + (now - (investment.pausedAt || now));
    
    await ctx.db.patch(args.investmentId, {
      status: "active",
      pausedDuration: newPausedDuration,
      pausedAt: undefined,
      adminNotes: args.adminNotes,
      updatedAt: now,
    });

    // Create notification for user
    await ctx.db.insert("notifications", {
      userId: investment.userId,
      type: "investment",
      title: "Investment Resumed",
      message: `Your investment has been resumed. ${args.adminNotes || ""}`,
      priority: "normal",
      isRead: false,
      emailSent: false,
      createdAt: now,
      metadata: {
        investmentId: args.investmentId,
        status: "active",
      },
    });

    return { success: true };
  },
});

// Cancel investment (admin only)
export const cancelInvestment = mutation({
  args: {
    investmentId: v.id("investments"),
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
    await ctx.db.patch(args.investmentId, {
      status: "cancelled",
      adminNotes: args.adminNotes,
      updatedAt: now,
    });

    // Create notification for user
    await ctx.db.insert("notifications", {
      userId: investment.userId,
      type: "investment",
      title: "Investment Cancelled",
      message: `Your investment has been cancelled. ${args.adminNotes || ""}`,
      priority: "high",
      isRead: false,
      emailSent: false,
      createdAt: now,
      metadata: {
        investmentId: args.investmentId,
        status: "cancelled",
      },
    });

    return { success: true };
  },
});

// Get investment progress (for progress bars)
export const getInvestmentProgress = query({
  args: { investmentId: v.id("investments") },
  handler: async (ctx, args) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      return null;
    }

    const investment = await ctx.db.get(args.investmentId);
    if (!investment || investment.userId !== userMetadata.userId) {
      return null;
    }

    if (investment.status !== "active" || !investment.startDate || !investment.endDate) {
      return {
        progress: 0,
        daysRemaining: 0,
        totalDays: 0,
        status: investment.status,
      };
    }

    const now = Date.now();
    const totalDuration = investment.endDate - investment.startDate;
    const elapsed = now - investment.startDate;
    const pausedDuration = investment.pausedDuration || 0;
    const actualElapsed = elapsed - pausedDuration;
    
    const progress = Math.min(100, Math.max(0, (actualElapsed / totalDuration) * 100));
    const daysRemaining = Math.max(0, Math.ceil((investment.endDate - now) / (24 * 60 * 60 * 1000)));
    const totalDays = Math.ceil(totalDuration / (24 * 60 * 60 * 1000));

    return {
      progress,
      daysRemaining,
      totalDays,
      status: investment.status,
      pausedDuration: pausedDuration / (24 * 60 * 60 * 1000), // Convert to days
    };
  },
});

// Get all investments (admin only)
export const getAllInvestments = query({
  args: {
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("cancelled"),
      v.literal("completed"),
      v.literal("failed")
    )),
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

    let query;
    
    if (args.status) {
      query = ctx.db.query("investments").withIndex("by_status", (q) => q.eq("status", args.status!));
    } else {
      query = ctx.db.query("investments").withIndex("by_created_at");
    }

    const limit = args.limit || 50;
    const investments = await query
      .order("desc")
      .take(limit);

    // Get plan details for each investment
    const investmentsWithPlans = await Promise.all(
      investments.map(async (investment) => {
        const plan = await ctx.db.get(investment.planId);
        return {
          ...investment,
          plan,
        };
      })
    );

    return investmentsWithPlans;
  },
});
