import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { betterAuthComponent } from "./auth";

// Get user balances
export const getUserBalances = query({
  args: {},
  handler: async (ctx) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      return null;
    }

    const balances = await ctx.db
      .query("userBalances")
      .withIndex("by_user", (q) => q.eq("userId", userMetadata.userId!))
      .first();

    if (!balances) {
      // Create initial balances if they don't exist
      const now = Date.now();
      const initialBalances = {
        userId: userMetadata.userId!,
        mainBalance: 0,
        interestBalance: 0,
        investmentBalance: 0,
        totalBalance: 0,
        createdAt: now,
        updatedAt: now,
      };
      
      const balanceId = await ctx.db.insert("userBalances", initialBalances);
      return { ...initialBalances, _id: balanceId };
    }

    return balances;
  },
});

// Update user balance (internal use)
export const updateUserBalance = mutation({
  args: {
    userId: v.string(),
    balanceType: v.union(
      v.literal("main"),
      v.literal("interest"),
      v.literal("investment")
    ),
    amount: v.number(), // Positive to add, negative to subtract
  },
  handler: async (ctx, args) => {
    const balances = await ctx.db
      .query("userBalances")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!balances) {
      throw new Error("User balances not found");
    }

    const now = Date.now();
    let updateData: any = {
      updatedAt: now,
    };

    // Update the specific balance type
    switch (args.balanceType) {
      case "main":
        updateData.mainBalance = Math.max(0, balances.mainBalance + args.amount);
        break;
      case "interest":
        updateData.interestBalance = Math.max(0, balances.interestBalance + args.amount);
        break;
      case "investment":
        updateData.investmentBalance = Math.max(0, balances.investmentBalance + args.amount);
        break;
    }

    // Calculate total balance
    updateData.totalBalance = 
      updateData.mainBalance + 
      updateData.interestBalance + 
      updateData.investmentBalance;

    await ctx.db.patch(balances._id, updateData);

    return { success: true };
  },
});

// Add to user balance (for deposits and investment returns)
export const addToUserBalance = mutation({
  args: {
    userId: v.string(),
    balanceType: v.union(
      v.literal("main"),
      v.literal("interest"),
      v.literal("investment")
    ),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.amount <= 0) {
      throw new Error("Amount must be positive");
    }

    return await ctx.runMutation(internal.userBalances.updateUserBalance, {
      userId: args.userId,
      balanceType: args.balanceType,
      amount: args.amount,
    });
  },
});

// Subtract from user balance (for withdrawals)
export const subtractFromUserBalance = mutation({
  args: {
    userId: v.string(),
    balanceType: v.union(
      v.literal("main"),
      v.literal("interest"),
      v.literal("investment")
    ),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.amount <= 0) {
      throw new Error("Amount must be positive");
    }

    return await ctx.runMutation(internal.userBalances.updateUserBalance, {
      userId: args.userId,
      balanceType: args.balanceType,
      amount: -args.amount,
    });
  },
});

// Get all user balances (admin only)
export const getAllUserBalances = query({
  args: {
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

    const limit = args.limit || 50;
    return await ctx.db
      .query("userBalances")
      .order("desc")
      .take(limit);
  },
});

// Internal functions
export const internal = {
  updateUserBalance: mutation({
    args: {
      userId: v.string(),
      balanceType: v.union(
        v.literal("main"),
        v.literal("interest"),
        v.literal("investment")
      ),
      amount: v.number(),
    },
    handler: async (ctx, args) => {
      const balances = await ctx.db
        .query("userBalances")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .first();

      if (!balances) {
        throw new Error("User balances not found");
      }

      const now = Date.now();
      let updateData: any = {
        updatedAt: now,
      };

      // Update the specific balance type
      switch (args.balanceType) {
        case "main":
          updateData.mainBalance = Math.max(0, balances.mainBalance + args.amount);
          break;
        case "interest":
          updateData.interestBalance = Math.max(0, balances.interestBalance + args.amount);
          break;
        case "investment":
          updateData.investmentBalance = Math.max(0, balances.investmentBalance + args.amount);
          break;
      }

      // Calculate total balance
      updateData.totalBalance = 
        updateData.mainBalance + 
        updateData.interestBalance + 
        updateData.investmentBalance;

      await ctx.db.patch(balances._id, updateData);

      return { success: true };
    },
  }),
};
