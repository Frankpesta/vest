import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { betterAuthComponent } from "./auth";
import { internal } from "./_generated/api";

// Get user's transactions
export const getUserTransactions = query({
  args: {
    type: v.optional(v.union(
      v.literal("deposit"),
      v.literal("withdrawal"),
      v.literal("investment"),
      v.literal("return"),
      v.literal("fee"),
      v.literal("refund")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      return [];
    }

    let query = ctx.db.query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", userMetadata.userId!));

    if (args.type) {
      query = query.filter((q) => q.eq(q.field("type"), args.type));
    }

    const limit = args.limit || 50;
    return await query
      .order("desc")
      .take(limit);
  },
});

// Create deposit transaction
export const createDeposit = mutation({
  args: {
    amount: v.number(), // Amount in USD
    currency: v.string(), // Original currency (ETH, BTC, etc.)
    cryptoAmount: v.number(), // Original crypto amount
    usdValue: v.number(), // USD value at time of deposit
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

    const now = Date.now();
    const expiresAt = now + (24 * 60 * 60 * 1000); // 24 hours

    // Create pending transaction
    const pendingTxId = await ctx.db.insert("pendingTransactions", {
      userId: userMetadata.userId,
      type: "deposit",
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

    // Create transaction record (pending status)
    const transactionId = await ctx.db.insert("transactions", {
      userId: userMetadata.userId,
      type: "deposit",
      amount: args.amount,
      currency: args.currency,
      usdValue: args.usdValue,
      status: "pending",
      txHash: args.transactionHash,
      fromAddress: args.fromAddress,
      toAddress: args.toAddress,
      network: args.chain,
      createdAt: now,
      updatedAt: now,
    });

    // Create notification for admin
    await ctx.db.insert("notifications", {
      userId: userMetadata.userId,
      type: "deposit",
      title: "Deposit Pending",
      message: `Your deposit of $${args.usdValue.toLocaleString()} is pending admin confirmation.`,
      priority: "medium",
      isRead: false,
      metadata: {
        transactionId,
        pendingTxId,
        amount: args.usdValue,
        currency: args.currency,
      },
      createdAt: now,
    });

    return { transactionId, pendingTxId };
  },
});

// Confirm pending transaction (admin only)
export const confirmPendingTransaction = mutation({
  args: {
    pendingTxId: v.id("pendingTransactions"),
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

    const pendingTx = await ctx.db.get(args.pendingTxId);
    if (!pendingTx) {
      throw new Error("Pending transaction not found");
    }

    if (pendingTx.status !== "pending") {
      throw new Error("Transaction already processed");
    }

    const now = Date.now();

    // Update pending transaction status
    await ctx.db.patch(args.pendingTxId, {
      status: "confirmed",
      reviewedBy: userMetadata.userId,
      reviewedAt: now,
      adminNotes: args.adminNotes,
      updatedAt: now,
    });

    // Update or create main transaction record
    const existingTx = await ctx.db
      .query("transactions")
      .withIndex("by_tx_hash", (q) => q.eq("txHash", pendingTx.transactionHash))
      .first();

    if (existingTx) {
      await ctx.db.patch(existingTx._id, {
        status: "completed",
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("transactions", {
        userId: pendingTx.userId,
        type: pendingTx.type,
        amount: pendingTx.amount,
        currency: pendingTx.currency,
        usdValue: pendingTx.usdValue,
        status: "completed",
        txHash: pendingTx.transactionHash,
        fromAddress: pendingTx.fromAddress,
        toAddress: pendingTx.toAddress,
        network: pendingTx.chain,
        createdAt: pendingTx.createdAt,
        updatedAt: now,
      });
    }

    // Handle based on transaction type
    if (pendingTx.type === "deposit") {
      // Add to user's main balance
      let balances = await ctx.db
        .query("userBalances")
        .withIndex("by_user", (q) => q.eq("userId", pendingTx.userId))
        .first();

      if (!balances) {
        const now = Date.now();
        const balanceId = await ctx.db.insert("userBalances", {
          userId: pendingTx.userId,
          mainBalance: 0,
          interestBalance: 0,
          investmentBalance: 0,
          totalBalance: 0,
          createdAt: now,
          updatedAt: now,
        });
        balances = await ctx.db.get(balanceId);
      }

      const newMainBalance = balances!.mainBalance + pendingTx.usdValue;
      const newTotalBalance = newMainBalance + balances!.interestBalance + balances!.investmentBalance;
      
      await ctx.db.patch(balances!._id, {
        mainBalance: newMainBalance,
        totalBalance: newTotalBalance,
        updatedAt: now,
      });

      await ctx.db.insert("notifications", {
        userId: pendingTx.userId,
        type: "deposit",
        title: "Deposit Confirmed",
        message: `Your deposit of $${pendingTx.usdValue.toLocaleString()} has been confirmed and added to your main balance.`,
        priority: "medium",
        isRead: false,
        metadata: {
          amount: pendingTx.usdValue,
          currency: pendingTx.currency,
        },
        createdAt: now,
      });
    } else if (pendingTx.type === "investment" && pendingTx.planId) {
      // Activate the investment
      const investment = await ctx.db
        .query("investments")
        .withIndex("by_transaction", (q) => q.eq("transactionHash", pendingTx.transactionHash))
        .first();

      if (investment) {
        const plan = await ctx.db.get(pendingTx.planId);
        if (plan) {
          await ctx.db.patch(investment._id, {
            status: "active",
            startDate: now,
            endDate: now + (plan.duration * 24 * 60 * 60 * 1000),
            lastProfitCalculation: now,
            updatedAt: now,
          });

          await ctx.db.insert("notifications", {
            userId: pendingTx.userId,
            type: "investment",
            title: "Investment Activated",
            message: `Your investment of $${pendingTx.usdValue.toLocaleString()} in ${plan.name} has been activated and is now earning returns.`,
            priority: "medium",
            isRead: false,
            metadata: {
              investmentId: investment._id,
              planName: plan.name,
            },
            createdAt: now,
          });
        }
      }
    }

    return { success: true };
  },
});

// Reject pending transaction (admin only)
export const rejectPendingTransaction = mutation({
  args: {
    pendingTxId: v.id("pendingTransactions"),
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

    const pendingTx = await ctx.db.get(args.pendingTxId);
    if (!pendingTx) {
      throw new Error("Pending transaction not found");
    }

    if (pendingTx.status !== "pending") {
      throw new Error("Transaction already processed");
    }

    const now = Date.now();

    // Update pending transaction status
    await ctx.db.patch(args.pendingTxId, {
      status: "rejected",
      reviewedBy: userMetadata.userId,
      reviewedAt: now,
      adminNotes: args.adminNotes,
      updatedAt: now,
    });

    // Update main transaction record if it exists
    const existingTx = await ctx.db
      .query("transactions")
      .withIndex("by_tx_hash", (q) => q.eq("txHash", pendingTx.transactionHash))
      .first();

    if (existingTx) {
      await ctx.db.patch(existingTx._id, {
        status: "failed",
        adminNotes: args.reason,
        updatedAt: now,
      });
    }

    // Create notification for user
    await ctx.db.insert("notifications", {
      userId: pendingTx.userId,
      type: pendingTx.type,
      title: `${pendingTx.type.charAt(0).toUpperCase() + pendingTx.type.slice(1)} Rejected`,
      message: `Your ${pendingTx.type} of $${pendingTx.usdValue.toLocaleString()} was rejected. Reason: ${args.reason}`,
      priority: "high",
      isRead: false,
      metadata: {
        reason: args.reason,
        amount: pendingTx.usdValue,
        currency: pendingTx.currency,
      },
      createdAt: now,
    });

    return { success: true };
  },
});

// Get user's pending transactions
export const getUserPendingTransactions = query({
  args: {
    type: v.optional(v.union(v.literal("deposit"), v.literal("investment"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      return [];
    }

    let query = ctx.db.query("pendingTransactions")
      .withIndex("by_user", (q) => q.eq("userId", userMetadata.userId!))
      .filter((q) => q.eq(q.field("status"), "pending"));

    if (args.type) {
      query = query.filter((q) => q.eq(q.field("type"), args.type));
    }

    const limit = args.limit || 50;
    return await query
      .order("desc")
      .take(limit);
  },
});

// Get pending transactions (admin only)
export const getPendingTransactions = query({
  args: {
    type: v.optional(v.union(v.literal("deposit"), v.literal("investment"))),
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

    let query = ctx.db.query("pendingTransactions")
      .withIndex("by_status", (q) => q.eq("status", "pending"));

    if (args.type) {
      query = query.filter((q) => q.eq(q.field("type"), args.type));
    }

    const limit = args.limit || 50;
    const pendingTxs = await query
      .order("desc")
      .take(limit);

    // Get plan details for investment transactions
    const pendingTxsWithPlans = await Promise.all(
      pendingTxs.map(async (tx) => {
        if (tx.type === "investment" && tx.planId) {
          const plan = await ctx.db.get(tx.planId);
          return {
            ...tx,
            plan,
          };
        }
        return tx;
      })
    );

    return pendingTxsWithPlans;
  },
});

// Update transaction confirmations
export const updateTransactionConfirmations = mutation({
  args: {
    transactionHash: v.string(),
    confirmations: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Update pending transaction
    const pendingTx = await ctx.db
      .query("pendingTransactions")
      .withIndex("by_transaction", (q) => q.eq("transactionHash", args.transactionHash))
      .first();

    if (pendingTx) {
      await ctx.db.patch(pendingTx._id, {
        confirmations: args.confirmations,
        updatedAt: now,
      });
    }

    // Update investment if it exists
    const investment = await ctx.db
      .query("investments")
      .withIndex("by_transaction", (q) => q.eq("transactionHash", args.transactionHash))
      .first();

    if (investment) {
      await ctx.db.patch(investment._id, {
        confirmations: args.confirmations,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});
