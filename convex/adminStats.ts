import { query } from "./_generated/server";
import { v } from "convex/values";
import { betterAuthComponent } from "./auth";

// Get comprehensive admin statistics
export const getAdminStats = query({
  args: {},
  handler: async (ctx) => {
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

    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);

    // Get all users (excluding admins)
    const allUsers = await ctx.db
      .query("userProfiles")
      .filter((q) => q.eq(q.field("role"), "user"))
      .collect();

    // Get all investments
    const allInvestments = await ctx.db
      .query("investments")
      .collect();

    // Get all transactions
    const allTransactions = await ctx.db
      .query("transactions")
      .collect();

    // Get all withdrawal requests
    const allWithdrawals = await ctx.db
      .query("withdrawalRequests")
      .collect();

    // Support tickets removed - table deleted from schema
    const allSupportTickets: any[] = [];

    // Calculate user statistics
    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter(user => user.isActive).length;
    const verifiedUsers = allUsers.filter(user => user.identityVerified).length;
    const newUsersToday = allUsers.filter(user => user.createdAt >= oneDayAgo).length;
    const newUsersThisWeek = allUsers.filter(user => user.createdAt >= oneWeekAgo).length;
    const newUsersThisMonth = allUsers.filter(user => user.createdAt >= oneMonthAgo).length;

    // Calculate investment statistics
    const totalInvestments = allInvestments.length;
    const activeInvestments = allInvestments.filter(inv => inv.status === "active").length;
    const completedInvestments = allInvestments.filter(inv => inv.status === "completed").length;
    const totalInvestedAmount = allInvestments.reduce((sum, inv) => sum + inv.usdValue, 0);
    const totalReturns = allInvestments.reduce((sum, inv) => sum + (inv.totalReturn || 0), 0);
    const newInvestmentsToday = allInvestments.filter(inv => inv.createdAt >= oneDayAgo).length;
    const newInvestmentsThisWeek = allInvestments.filter(inv => inv.createdAt >= oneWeekAgo).length;

    // Calculate transaction statistics
    const totalTransactions = allTransactions.length;
    const completedTransactions = allTransactions.filter(tx => tx.status === "completed").length;
    const pendingTransactions = allTransactions.filter(tx => tx.status === "pending").length;
    const totalDeposits = allTransactions
      .filter(tx => tx.type === "deposit" && tx.status === "completed")
      .reduce((sum, tx) => sum + tx.usdValue, 0);
    const totalWithdrawals = allWithdrawals
      .filter(w => w.status === "completed")
      .reduce((sum, w) => sum + w.amount, 0);
    const pendingWithdrawals = allWithdrawals.filter(w => w.status === "pending").length;

    // Calculate support statistics
    const totalSupportTickets = allSupportTickets.length;
    const openTickets = allSupportTickets.filter(ticket => ticket.status === "open").length;
    const inProgressTickets = allSupportTickets.filter(ticket => ticket.status === "in_progress").length;
    const resolvedTickets = allSupportTickets.filter(ticket => ticket.status === "resolved").length;

    // Calculate revenue statistics
    const totalRevenue = totalReturns; // Total returns generated
    const averageInvestment = totalInvestments > 0 ? totalInvestedAmount / totalInvestments : 0;
    const successRate = totalInvestments > 0 ? (completedInvestments / totalInvestments) * 100 : 0;

    // Get recent users (last 10)
    const recentUsers = allUsers
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10);

    // Get recent investments (last 10)
    const recentInvestments = allInvestments
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10);

    // Get recent transactions (last 10)
    const recentTransactions = allTransactions
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10);

    return {
      // User Statistics
      users: {
        total: totalUsers,
        active: activeUsers,
        verified: verifiedUsers,
        newToday: newUsersToday,
        newThisWeek: newUsersThisWeek,
        newThisMonth: newUsersThisMonth,
        recent: recentUsers
      },
      
      // Investment Statistics
      investments: {
        total: totalInvestments,
        active: activeInvestments,
        completed: completedInvestments,
        totalAmount: totalInvestedAmount,
        totalReturns: totalReturns,
        newToday: newInvestmentsToday,
        newThisWeek: newInvestmentsThisWeek,
        average: averageInvestment,
        successRate: successRate,
        recent: recentInvestments
      },
      
      // Transaction Statistics
      transactions: {
        total: totalTransactions,
        completed: completedTransactions,
        pending: pendingTransactions,
        totalDeposits: totalDeposits,
        totalWithdrawals: totalWithdrawals,
        pendingWithdrawals: pendingWithdrawals,
        recent: recentTransactions
      },
      
      // Support Statistics
      support: {
        totalTickets: totalSupportTickets,
        openTickets: openTickets,
        inProgressTickets: inProgressTickets,
        resolvedTickets: resolvedTickets
      },
      
      // Revenue Statistics
      revenue: {
        total: totalRevenue,
        totalInvested: totalInvestedAmount,
        netProfit: totalRevenue - totalInvestedAmount
      }
    };
  },
});

// Get user growth data for charts
export const getUserGrowthData = query({
  args: {
    days: v.optional(v.number()), // Number of days to look back
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

    const days = args.days || 30;
    const now = Date.now();
    const startDate = now - (days * 24 * 60 * 60 * 1000);

    // Get all users created in the specified period
    const users = await ctx.db
      .query("userProfiles")
      .filter((q) => 
        q.and(
          q.eq(q.field("role"), "user"),
          q.gte(q.field("createdAt"), startDate)
        )
      )
      .collect();

    // Group users by day
    const dailyData: { [key: string]: number } = {};
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now - (i * 24 * 60 * 60 * 1000));
      const dateKey = date.toISOString().split('T')[0];
      dailyData[dateKey] = 0;
    }

    users.forEach(user => {
      const date = new Date(user.createdAt);
      const dateKey = date.toISOString().split('T')[0];
      if (dailyData[dateKey] !== undefined) {
        dailyData[dateKey]++;
      }
    });

    // Convert to array format for charts
    const chartData = Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        date,
        users: count
      }));

    return chartData;
  },
});

// Get investment performance data for charts
export const getInvestmentPerformanceData = query({
  args: {
    days: v.optional(v.number()),
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

    const days = args.days || 30;
    const now = Date.now();
    const startDate = now - (days * 24 * 60 * 60 * 1000);

    // Get all investments created in the specified period
    const investments = await ctx.db
      .query("investments")
      .filter((q) => q.gte(q.field("createdAt"), startDate))
      .collect();

    // Group investments by day
    const dailyData: { [key: string]: { amount: number; count: number } } = {};
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now - (i * 24 * 60 * 60 * 1000));
      const dateKey = date.toISOString().split('T')[0];
      dailyData[dateKey] = { amount: 0, count: 0 };
    }

    investments.forEach(investment => {
      const date = new Date(investment.createdAt);
      const dateKey = date.toISOString().split('T')[0];
      if (dailyData[dateKey]) {
        dailyData[dateKey].amount += investment.usdValue;
        dailyData[dateKey].count += 1;
      }
    });

    // Convert to array format for charts
    const chartData = Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        amount: data.amount,
        count: data.count
      }));

    return chartData;
  },
});
