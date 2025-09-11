import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Calculate daily investment profits
export const calculateInvestmentProfits = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    // Get all active investments that need profit calculation
    const activeInvestments = await ctx.db
      .query("investments")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .filter((q) => 
        q.and(
          q.neq(q.field("startDate"), undefined),
          q.or(
            q.eq(q.field("lastProfitCalculation"), undefined),
            q.lt(q.field("lastProfitCalculation"), oneDayAgo)
          )
        )
      )
      .collect();

    for (const investment of activeInvestments) {
      if (!investment.startDate || !investment.endDate) continue;

      const plan = await ctx.db.get(investment.planId);
      if (!plan) continue;

      // Calculate days since last profit calculation
      const lastCalculation = investment.lastProfitCalculation || investment.startDate;
      const daysSinceLastCalculation = Math.floor((now - lastCalculation) / (24 * 60 * 60 * 1000));
      
      if (daysSinceLastCalculation < 1) continue;

      // Calculate daily profit rate
      const dailyRate = plan.maxAPY / 365 / 100; // Convert APY to daily rate
      
      // Calculate profit for the period
      const profit = investment.usdValue * dailyRate * daysSinceLastCalculation;
      
      // Update investment with new profit
      const newActualReturn = (investment.actualReturn || 0) + profit;
      const newTotalReturn = (investment.totalReturn || 0) + profit;

      await ctx.db.patch(investment._id, {
        actualReturn: newActualReturn,
        totalReturn: newTotalReturn,
        lastProfitCalculation: now,
        updatedAt: now,
      });

      // Create transaction record for the profit
      await ctx.db.insert("transactions", {
        userId: investment.userId,
        type: "return",
        amount: profit,
        currency: "USD",
        usdValue: profit,
        status: "completed",
        network: "internal",
        createdAt: now,
        updatedAt: now,
      });

      // Create notification for user
      await ctx.db.insert("notifications", {
        userId: investment.userId,
        type: "investment",
        title: "Daily Profit Earned",
        message: `You earned $${profit.toFixed(2)} from your investment in ${plan.name}.`,
        priority: "low",
        isRead: false,
        metadata: {
          investmentId: investment._id,
          planName: plan.name,
          profit,
        },
        createdAt: now,
      });
    }

    return { processedInvestments: activeInvestments.length };
  },
});

// Check for completed investments
export const checkCompletedInvestments = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Get all active investments that have reached their end date
    const completedInvestments = await ctx.db
      .query("investments")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .filter((q) => 
        q.and(
          q.neq(q.field("endDate"), undefined),
          q.lte(q.field("endDate"), now)
        )
      )
      .collect();

    for (const investment of completedInvestments) {
      const plan = await ctx.db.get(investment.planId);
      if (!plan) continue;

      // Mark investment as completed
      await ctx.db.patch(investment._id, {
        status: "completed",
        updatedAt: now,
      });

      // Create final profit transaction if there's remaining profit
      const finalProfit = (investment.totalReturn || 0) - (investment.actualReturn || 0);
      if (finalProfit > 0) {
        await ctx.db.patch(investment._id, {
          actualReturn: investment.totalReturn || 0,
          updatedAt: now,
        });

        await ctx.db.insert("transactions", {
          userId: investment.userId,
          type: "return",
          amount: finalProfit,
          currency: "USD",
          usdValue: finalProfit,
          status: "completed",
          network: "internal",
          createdAt: now,
          updatedAt: now,
        });
      }

      // Distribute balances: interest goes to interest balance, principal goes to investment balance
      const totalReturn = investment.totalReturn || 0;
      const principal = investment.usdValue;
      
      // Add interest to interest balance
      if (totalReturn > 0) {
        // Get or create user balances
        let balances = await ctx.db
          .query("userBalances")
          .withIndex("by_user", (q) => q.eq("userId", investment.userId))
          .first();

        if (!balances) {
          const now = Date.now();
          const balanceId = await ctx.db.insert("userBalances", {
            userId: investment.userId,
            mainBalance: 0,
            interestBalance: 0,
            investmentBalance: 0,
            totalBalance: 0,
            createdAt: now,
            updatedAt: now,
          });
          balances = await ctx.db.get(balanceId);
        }

        // Update balances
        const newInterestBalance = balances!.interestBalance + totalReturn;
        const newTotalBalance = balances!.mainBalance + newInterestBalance + balances!.investmentBalance + principal;
        
        await ctx.db.patch(balances!._id, {
          interestBalance: newInterestBalance,
          investmentBalance: balances!.investmentBalance + principal,
          totalBalance: newTotalBalance,
          updatedAt: now,
        });
      } else {
        // Just add principal to investment balance
        let balances = await ctx.db
          .query("userBalances")
          .withIndex("by_user", (q) => q.eq("userId", investment.userId))
          .first();

        if (!balances) {
          const now = Date.now();
          const balanceId = await ctx.db.insert("userBalances", {
            userId: investment.userId,
            mainBalance: 0,
            interestBalance: 0,
            investmentBalance: 0,
            totalBalance: 0,
            createdAt: now,
            updatedAt: now,
          });
          balances = await ctx.db.get(balanceId);
        }

        const newInvestmentBalance = balances!.investmentBalance + principal;
        const newTotalBalance = balances!.mainBalance + balances!.interestBalance + newInvestmentBalance;
        
        await ctx.db.patch(balances!._id, {
          investmentBalance: newInvestmentBalance,
          totalBalance: newTotalBalance,
          updatedAt: now,
        });
      }

      // Create notification for user
      await ctx.db.insert("notifications", {
        userId: investment.userId,
        type: "investment",
        title: "Investment Completed",
        message: `Your investment in ${plan.name} has completed! Total profit: $${(investment.totalReturn || 0).toFixed(2)}`,
        priority: "normal",
        isRead: false,
        metadata: {
          investmentId: investment._id,
          planName: plan.name,
          totalProfit: investment.totalReturn || 0,
        },
        createdAt: now,
      });
    }

    return { completedInvestments: completedInvestments.length };
  },
});

// Clean up expired pending transactions
export const cleanupExpiredTransactions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Get all expired pending transactions
    const expiredTransactions = await ctx.db
      .query("pendingTransactions")
      .withIndex("by_expires", (q) => q.lte("expiresAt", now))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    for (const tx of expiredTransactions) {
      // Mark as expired
      await ctx.db.patch(tx._id, {
        status: "rejected",
        adminNotes: "Transaction expired after 24 hours",
        updatedAt: now,
      });

      // Update main transaction record if it exists
      const existingTx = await ctx.db
        .query("transactions")
        .withIndex("by_tx_hash", (q) => q.eq("txHash", tx.transactionHash))
        .first();

      if (existingTx) {
        await ctx.db.patch(existingTx._id, {
          status: "failed",
          adminNotes: "Transaction expired",
          updatedAt: now,
        });
      }

      // Create notification for user
      await ctx.db.insert("notifications", {
        userId: tx.userId,
        type: tx.type,
        title: "Transaction Expired",
        message: `Your ${tx.type} of $${tx.usdValue.toLocaleString()} has expired and was automatically cancelled.`,
        priority: "high",
        isRead: false,
        metadata: {
          amount: tx.usdValue,
          currency: tx.currency,
          type: tx.type,
        },
        createdAt: now,
      });
    }

    return { cleanedUpTransactions: expiredTransactions.length };
  },
});

// Get investment statistics for admin dashboard
export const getInvestmentStats = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    // Get all investments
    const allInvestments = await ctx.db
      .query("investments")
      .collect();

    // Get recent investments (last 30 days)
    const recentInvestments = allInvestments.filter(
      inv => inv.createdAt >= thirtyDaysAgo
    );

    // Calculate statistics
    const totalInvestments = allInvestments.length;
    const activeInvestments = allInvestments.filter(inv => inv.status === "active").length;
    const completedInvestments = allInvestments.filter(inv => inv.status === "completed").length;
    const totalInvested = allInvestments.reduce((sum, inv) => sum + inv.usdValue, 0);
    const totalReturns = allInvestments.reduce((sum, inv) => sum + (inv.totalReturn || 0), 0);
    const recentInvested = recentInvestments.reduce((sum, inv) => sum + inv.usdValue, 0);

    return {
      totalInvestments,
      activeInvestments,
      completedInvestments,
      totalInvested,
      totalReturns,
      recentInvested,
      averageInvestment: totalInvestments > 0 ? totalInvested / totalInvestments : 0,
      successRate: totalInvestments > 0 ? (completedInvestments / totalInvestments) * 100 : 0,
    };
  },
});
