import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { betterAuthComponent } from "./auth";
import { internal } from "./_generated/api";

// Get user's withdrawal requests
export const getUserWithdrawalRequests = query({
  args: {
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      return [];
    }

    let query = ctx.db.query("withdrawalRequests")
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

// Create withdrawal request
export const createWithdrawalRequest = mutation({
  args: {
    balanceType: v.union(
      v.literal("main"),
      v.literal("interest"),
      v.literal("investment")
    ),
    amount: v.number(), // USD amount
    currency: v.string(), // Crypto currency
    cryptoAmount: v.number(), // Amount in crypto
    walletAddress: v.string(),
    chain: v.string(),
  },
  handler: async (ctx, args) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      throw new Error("Not authenticated");
    }

    if (args.amount <= 0) {
      throw new Error("Amount must be positive");
    }

    // Check if user has sufficient balance
    const balances = await ctx.db
      .query("userBalances")
      .withIndex("by_user", (q) => q.eq("userId", userMetadata.userId!))
      .first();

    if (!balances) {
      throw new Error("User balances not found");
    }

    let availableBalance = 0;
    switch (args.balanceType) {
      case "main":
        availableBalance = balances.mainBalance;
        break;
      case "interest":
        availableBalance = balances.interestBalance;
        break;
      case "investment":
        availableBalance = balances.investmentBalance;
        break;
    }

    if (args.amount > availableBalance) {
      throw new Error(`Insufficient ${args.balanceType} balance`);
    }

    const now = Date.now();

    // Create withdrawal request
    const requestId = await ctx.db.insert("withdrawalRequests", {
      userId: userMetadata.userId!,
      balanceType: args.balanceType,
      amount: args.amount,
      currency: args.currency,
      cryptoAmount: args.cryptoAmount,
      walletAddress: args.walletAddress,
      chain: args.chain,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    // Create notification for admin
    await ctx.db.insert("notifications", {
      userId: userMetadata.userId!,
      type: "withdrawal",
      title: "Withdrawal Request Submitted",
      message: `You have submitted a withdrawal request for $${args.amount.toLocaleString()} from your ${args.balanceType} balance.`,
      priority: "medium",
      isRead: false,
      metadata: {
        requestId,
        amount: args.amount,
        balanceType: args.balanceType,
        currency: args.currency,
      },
      createdAt: now,
    });

    return { requestId };
  },
});

// Approve withdrawal request (admin only)
export const approveWithdrawalRequest = mutation({
  args: {
    requestId: v.id("withdrawalRequests"),
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

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Withdrawal request not found");
    }

    if (request.status !== "pending") {
      throw new Error("Request is not pending");
    }

    const now = Date.now();

    // Update request status
    await ctx.db.patch(args.requestId, {
      status: "approved",
      reviewedBy: userMetadata.userId!,
      reviewedAt: now,
      adminNotes: args.adminNotes,
      updatedAt: now,
    });

    // Create notification for user
    await ctx.db.insert("notifications", {
      userId: request.userId,
      type: "withdrawal",
      title: "Withdrawal Approved",
      message: `Your withdrawal request for $${request.amount.toLocaleString()} has been approved and is being processed.`,
      priority: "medium",
      isRead: false,
      metadata: {
        requestId: args.requestId,
        amount: request.amount,
        balanceType: request.balanceType,
      },
      createdAt: now,
    });

    return { success: true };
  },
});

// Reject withdrawal request (admin only)
export const rejectWithdrawalRequest = mutation({
  args: {
    requestId: v.id("withdrawalRequests"),
    reason: v.string(),
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

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Withdrawal request not found");
    }

    if (request.status !== "pending") {
      throw new Error("Request is not pending");
    }

    const now = Date.now();

    // Update request status
    await ctx.db.patch(args.requestId, {
      status: "rejected",
      reviewedBy: userMetadata.userId!,
      reviewedAt: now,
      adminNotes: args.adminNotes || args.reason,
      updatedAt: now,
    });

    // Create notification for user
    await ctx.db.insert("notifications", {
      userId: request.userId,
      type: "withdrawal",
      title: "Withdrawal Rejected",
      message: `Your withdrawal request for $${request.amount.toLocaleString()} has been rejected. Reason: ${args.reason}`,
      priority: "high",
      isRead: false,
      metadata: {
        requestId: args.requestId,
        amount: request.amount,
        balanceType: request.balanceType,
        reason: args.reason,
      },
      createdAt: now,
    });

    return { success: true };
  },
});

// Mark withdrawal as processing (admin only)
export const markWithdrawalProcessing = mutation({
  args: {
    requestId: v.id("withdrawalRequests"),
    transactionHash: v.string(),
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

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Withdrawal request not found");
    }

    if (request.status !== "approved") {
      throw new Error("Request must be approved first");
    }

    const now = Date.now();

    // Update request status
    await ctx.db.patch(args.requestId, {
      status: "processing",
      transactionHash: args.transactionHash,
      processedAt: now,
      adminNotes: args.adminNotes,
      updatedAt: now,
    });

    // Subtract from user balance
    let balances = await ctx.db
      .query("userBalances")
      .withIndex("by_user", (q) => q.eq("userId", request.userId))
      .first();

    if (!balances) {
      throw new Error("User balances not found");
    }

    let updateData: any = {
      updatedAt: now,
    };

    // Update the specific balance type
    switch (request.balanceType) {
      case "main":
        updateData.mainBalance = Math.max(0, balances.mainBalance - request.amount);
        break;
      case "interest":
        updateData.interestBalance = Math.max(0, balances.interestBalance - request.amount);
        break;
      case "investment":
        updateData.investmentBalance = Math.max(0, balances.investmentBalance - request.amount);
        break;
    }

    // Calculate total balance
    updateData.totalBalance = 
      updateData.mainBalance + 
      updateData.interestBalance + 
      updateData.investmentBalance;

    await ctx.db.patch(balances._id, updateData);

    // Create transaction record
    await ctx.db.insert("transactions", {
      userId: request.userId,
      type: "withdrawal",
      amount: request.amount,
      currency: request.currency,
      usdValue: request.amount,
      status: "processing",
      txHash: args.transactionHash,
      fromAddress: "company", // Company wallet
      toAddress: request.walletAddress,
      network: request.chain,
      createdAt: now,
      updatedAt: now,
    });

    // Create notification for user
    await ctx.db.insert("notifications", {
      userId: request.userId,
      type: "withdrawal",
      title: "Withdrawal Processing",
      message: `Your withdrawal of $${request.amount.toLocaleString()} is being processed. Transaction: ${args.transactionHash.slice(0, 10)}...`,
      priority: "medium",
      isRead: false,
      metadata: {
        requestId: args.requestId,
        amount: request.amount,
        transactionHash: args.transactionHash,
      },
      createdAt: now,
    });

    return { success: true };
  },
});

// Mark withdrawal as completed (admin only)
export const markWithdrawalCompleted = mutation({
  args: {
    requestId: v.id("withdrawalRequests"),
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

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Withdrawal request not found");
    }

    if (request.status !== "processing") {
      throw new Error("Request must be processing first");
    }

    const now = Date.now();

    // Update request status
    await ctx.db.patch(args.requestId, {
      status: "completed",
      adminNotes: args.adminNotes,
      updatedAt: now,
    });

    // Update transaction record
    const transaction = await ctx.db
      .query("transactions")
      .withIndex("by_tx_hash", (q) => q.eq("txHash", request.transactionHash!))
      .first();

    if (transaction) {
      await ctx.db.patch(transaction._id, {
        status: "completed",
        updatedAt: now,
      });
    }

    // Create notification for user
    await ctx.db.insert("notifications", {
      userId: request.userId,
      type: "withdrawal",
      title: "Withdrawal Completed",
      message: `Your withdrawal of $${request.amount.toLocaleString()} has been completed and sent to your wallet.`,
      priority: "medium",
      isRead: false,
      metadata: {
        requestId: args.requestId,
        amount: request.amount,
        transactionHash: request.transactionHash,
      },
      createdAt: now,
    });

    return { success: true };
  },
});

// Get all withdrawal requests (admin only)
export const getAllWithdrawalRequests = query({
  args: {
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("processing"),
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
      query = ctx.db.query("withdrawalRequests").withIndex("by_status", (q) => q.eq("status", args.status!));
    } else {
      query = ctx.db.query("withdrawalRequests").withIndex("by_created_at");
    }

    const limit = args.limit || 50;
    return await query
      .order("desc")
      .take(limit);
  },
});
