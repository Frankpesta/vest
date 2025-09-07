import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { betterAuthComponent } from "./auth";

// Get all active investment plans
export const getActivePlans = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("investmentPlans")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .order("desc")
      .collect();
  },
});

// Get plans by category
export const getPlansByCategory = query({
  args: { 
    category: v.union(
      v.literal("crypto"),
      v.literal("real-estate"),
      v.literal("reits"),
      v.literal("forex"),
      v.literal("retirement"),
      v.literal("children")
    )
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("investmentPlans")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();
  },
});

// Get popular plans
export const getPopularPlans = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("investmentPlans")
      .withIndex("by_popular", (q) => q.eq("popular", true))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();
  },
});

// Get plan by ID
export const getPlanById = query({
  args: { planId: v.id("investmentPlans") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.planId);
  },
});

// Create new investment plan (admin only)
export const createPlan = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("crypto"),
      v.literal("real-estate"),
      v.literal("reits"),
      v.literal("forex"),
      v.literal("retirement"),
      v.literal("children")
    ),
    tier: v.union(
      v.literal("starter"),
      v.literal("professional"),
      v.literal("enterprise")
    ),
    price: v.string(),
    priceUSD: v.string(),
    apy: v.string(),
    minAPY: v.number(),
    maxAPY: v.number(),
    minInvestment: v.number(),
    maxInvestment: v.number(),
    duration: v.number(),
    riskLevel: v.union(
      v.literal("low"),
      v.literal("low-medium"),
      v.literal("medium"),
      v.literal("medium-high"),
      v.literal("high")
    ),
    features: v.array(v.string()),
    popular: v.boolean(),
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

    const now = Date.now();
    return await ctx.db.insert("investmentPlans", {
      ...args,
      isActive: true,
      totalInvested: 0,
      totalInvestors: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update investment plan (admin only)
export const updatePlan = mutation({
  args: {
    planId: v.id("investmentPlans"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.union(
      v.literal("crypto"),
      v.literal("real-estate"),
      v.literal("reits"),
      v.literal("forex"),
      v.literal("retirement"),
      v.literal("children")
    )),
    tier: v.optional(v.union(
      v.literal("starter"),
      v.literal("professional"),
      v.literal("enterprise")
    )),
    price: v.optional(v.string()),
    priceUSD: v.optional(v.string()),
    apy: v.optional(v.string()),
    minAPY: v.optional(v.number()),
    maxAPY: v.optional(v.number()),
    minInvestment: v.optional(v.number()),
    maxInvestment: v.optional(v.number()),
    duration: v.optional(v.number()),
    riskLevel: v.optional(v.union(
      v.literal("low"),
      v.literal("low-medium"),
      v.literal("medium"),
      v.literal("medium-high"),
      v.literal("high")
    )),
    features: v.optional(v.array(v.string())),
    popular: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
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

    const { planId, ...updateData } = args;
    const filteredData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(planId, {
      ...filteredData,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Delete investment plan (admin only)
export const deletePlan = mutation({
  args: { planId: v.id("investmentPlans") },
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

    // Check if plan has active investments
    const activeInvestments = await ctx.db
      .query("investments")
      .withIndex("by_plan", (q) => q.eq("planId", args.planId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    if (activeInvestments.length > 0) {
      throw new Error("Cannot delete plan with active investments");
    }

    await ctx.db.delete(args.planId);
    return { success: true };
  },
});

// Seed investment plans (admin only)
export const seedPlans = mutation({
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
    const plans = [
      // Crypto Plans
      {
        name: "Starter",
        description: "Perfect for crypto beginners",
        category: "crypto" as const,
        tier: "starter" as const,
        price: "0.1 ETH",
        priceUSD: "$170",
        apy: "12-18%",
        minAPY: 12,
        maxAPY: 18,
        minInvestment: 100,
        maxInvestment: 1000,
        duration: 30,
        riskLevel: "medium-high" as const,
        features: [
          "Access to 3 crypto categories",
          "Basic DeFi staking",
          "Monthly performance reports",
          "Email support",
          "Mobile app access",
        ],
        popular: false,
      },
      {
        name: "Professional",
        description: "Advanced crypto strategies",
        category: "crypto" as const,
        tier: "professional" as const,
        price: "1.0 ETH",
        priceUSD: "$1,700",
        apy: "18-25%",
        minAPY: 18,
        maxAPY: 25,
        minInvestment: 1000,
        maxInvestment: 10000,
        duration: 60,
        riskLevel: "high" as const,
        features: [
          "Access to all crypto categories",
          "Advanced DeFi strategies",
          "Weekly performance reports",
          "Priority support",
          "Yield farming opportunities",
          "Dedicated crypto advisor",
          "Multi-chain support",
          "Early access to new tokens",
        ],
        popular: true,
      },
      {
        name: "Enterprise",
        description: "Institutional crypto management",
        category: "crypto" as const,
        tier: "enterprise" as const,
        price: "10.0 ETH",
        priceUSD: "$17,000",
        apy: "20-30%",
        minAPY: 20,
        maxAPY: 30,
        minInvestment: 10000,
        maxInvestment: 100000,
        duration: 90,
        riskLevel: "high" as const,
        features: [
          "All Professional features",
          "Custom crypto strategies",
          "Real-time monitoring",
          "24/7 dedicated support",
          "Institutional-grade security",
          "Custom reporting",
          "Direct access to fund managers",
          "Exclusive token launches",
        ],
        popular: false,
      },
      // Real Estate Plans
      {
        name: "Starter",
        description: "Entry-level property investment",
        category: "real-estate" as const,
        tier: "starter" as const,
        price: "1.0 ETH",
        priceUSD: "$1,700",
        apy: "8-12%",
        minAPY: 8,
        maxAPY: 12,
        minInvestment: 1000,
        maxInvestment: 5000,
        duration: 365,
        riskLevel: "low-medium" as const,
        features: [
          "Access to 2 property types",
          "Basic portfolio analytics",
          "Quarterly reports",
          "Email support",
          "Property management included",
        ],
        popular: false,
      },
      {
        name: "Professional",
        description: "Diversified real estate portfolio",
        category: "real-estate" as const,
        tier: "professional" as const,
        price: "5.0 ETH",
        priceUSD: "$8,500",
        apy: "12-18%",
        minAPY: 12,
        maxAPY: 18,
        minInvestment: 5000,
        maxInvestment: 50000,
        duration: 730,
        riskLevel: "medium" as const,
        features: [
          "Access to all property types",
          "Advanced analytics",
          "Monthly reports",
          "Priority support",
          "International properties",
          "Dedicated property manager",
          "Tax optimization",
          "Early access to new projects",
        ],
        popular: true,
      },
      {
        name: "Enterprise",
        description: "Institutional real estate management",
        category: "real-estate" as const,
        tier: "enterprise" as const,
        price: "25.0 ETH",
        priceUSD: "$42,500",
        apy: "15-25%",
        minAPY: 15,
        maxAPY: 25,
        minInvestment: 50000,
        maxInvestment: 500000,
        duration: 1095,
        riskLevel: "medium-high" as const,
        features: [
          "All Professional features",
          "Custom property strategies",
          "Real-time monitoring",
          "24/7 dedicated support",
          "White-glove service",
          "Custom reporting",
          "Direct developer access",
          "Exclusive property deals",
        ],
        popular: false,
      },
      // REITs Plans
      {
        name: "Starter",
        description: "Basic REIT exposure",
        category: "reits" as const,
        tier: "starter" as const,
        price: "0.5 ETH",
        priceUSD: "$850",
        apy: "6-10%",
        minAPY: 6,
        maxAPY: 10,
        minInvestment: 500,
        maxInvestment: 2500,
        duration: 180,
        riskLevel: "low" as const,
        features: [
          "Access to 3 REIT sectors",
          "Basic portfolio tracking",
          "Monthly distributions",
          "Email support",
          "Mobile app access",
        ],
        popular: false,
      },
      {
        name: "Professional",
        description: "Diversified REIT portfolio",
        category: "reits" as const,
        tier: "professional" as const,
        price: "2.5 ETH",
        priceUSD: "$4,250",
        apy: "8-14%",
        minAPY: 8,
        maxAPY: 14,
        minInvestment: 2500,
        maxInvestment: 25000,
        duration: 365,
        riskLevel: "low-medium" as const,
        features: [
          "Access to all REIT sectors",
          "Advanced analytics",
          "Weekly distributions",
          "Priority support",
          "Global REIT exposure",
          "Dedicated advisor",
          "Tax optimization",
          "Early access to new REITs",
        ],
        popular: true,
      },
      {
        name: "Enterprise",
        description: "Institutional REIT management",
        category: "reits" as const,
        tier: "enterprise" as const,
        price: "12.5 ETH",
        priceUSD: "$21,250",
        apy: "10-18%",
        minAPY: 10,
        maxAPY: 18,
        minInvestment: 25000,
        maxInvestment: 250000,
        duration: 730,
        riskLevel: "medium" as const,
        features: [
          "All Professional features",
          "Custom REIT strategies",
          "Real-time monitoring",
          "24/7 dedicated support",
          "Institutional access",
          "Custom reporting",
          "Direct fund manager access",
          "Exclusive REIT opportunities",
        ],
        popular: false,
      },
      // Retirement Plans
      {
        name: "Starter",
        description: "Basic retirement planning",
        category: "retirement" as const,
        tier: "starter" as const,
        price: "0.25 ETH",
        priceUSD: "$425",
        apy: "7-12%",
        minAPY: 7,
        maxAPY: 12,
        minInvestment: 250,
        maxInvestment: 1250,
        duration: 1825, // 5 years
        riskLevel: "medium" as const,
        features: [
          "Basic portfolio allocation",
          "Annual reviews",
          "Email support",
          "Mobile app access",
          "Tax-advantaged growth",
        ],
        popular: false,
      },
      {
        name: "Professional",
        description: "Comprehensive retirement strategy",
        category: "retirement" as const,
        tier: "professional" as const,
        price: "1.25 ETH",
        priceUSD: "$2,125",
        apy: "10-16%",
        minAPY: 10,
        maxAPY: 16,
        minInvestment: 1250,
        maxInvestment: 12500,
        duration: 2555, // 7 years
        riskLevel: "medium" as const,
        features: [
          "Advanced portfolio allocation",
          "Quarterly reviews",
          "Priority support",
          "Professional advisory",
          "Tax optimization",
          "Dedicated advisor",
          "Flexible contributions",
          "Goal-based planning",
        ],
        popular: true,
      },
      {
        name: "Enterprise",
        description: "Institutional retirement management",
        category: "retirement" as const,
        tier: "enterprise" as const,
        price: "6.25 ETH",
        priceUSD: "$10,625",
        apy: "12-20%",
        minAPY: 12,
        maxAPY: 20,
        minInvestment: 12500,
        maxInvestment: 125000,
        duration: 3650, // 10 years
        riskLevel: "medium-high" as const,
        features: [
          "All Professional features",
          "Custom retirement strategies",
          "Real-time monitoring",
          "24/7 dedicated support",
          "White-glove service",
          "Custom reporting",
          "Direct advisor access",
          "Exclusive investment opportunities",
        ],
        popular: false,
      },
      // Children's Savings Plans
      {
        name: "Starter",
        description: "Basic children's savings",
        category: "children" as const,
        tier: "starter" as const,
        price: "0.1 ETH",
        priceUSD: "$170",
        apy: "8-14%",
        minAPY: 8,
        maxAPY: 14,
        minInvestment: 100,
        maxInvestment: 500,
        duration: 1095, // 3 years
        riskLevel: "medium" as const,
        features: [
          "Education-focused investments",
          "Annual reviews",
          "Email support",
          "Mobile app access",
          "Tax benefits",
        ],
        popular: false,
      },
      {
        name: "Professional",
        description: "Comprehensive education planning",
        category: "children" as const,
        tier: "professional" as const,
        price: "0.5 ETH",
        priceUSD: "$850",
        apy: "10-18%",
        minAPY: 10,
        maxAPY: 18,
        minInvestment: 500,
        maxInvestment: 5000,
        duration: 1825, // 5 years
        riskLevel: "medium" as const,
        features: [
          "Advanced education strategies",
          "Quarterly reviews",
          "Priority support",
          "Professional advisory",
          "Tax optimization",
          "Dedicated advisor",
          "Flexible contributions",
          "Goal-based planning",
        ],
        popular: true,
      },
      {
        name: "Enterprise",
        description: "Institutional education management",
        category: "children" as const,
        tier: "enterprise" as const,
        price: "2.5 ETH",
        priceUSD: "$4,250",
        apy: "12-22%",
        minAPY: 12,
        maxAPY: 22,
        minInvestment: 5000,
        maxInvestment: 50000,
        duration: 2555, // 7 years
        riskLevel: "medium-high" as const,
        features: [
          "All Professional features",
          "Custom education strategies",
          "Real-time monitoring",
          "24/7 dedicated support",
          "White-glove service",
          "Custom reporting",
          "Direct advisor access",
          "Exclusive opportunities",
        ],
        popular: false,
      },
      // Forex Plans
      {
        name: "Starter",
        description: "Basic forex exposure",
        category: "forex" as const,
        tier: "starter" as const,
        price: "0.5 ETH",
        priceUSD: "$850",
        apy: "10-16%",
        minAPY: 10,
        maxAPY: 16,
        minInvestment: 500,
        maxInvestment: 2500,
        duration: 90,
        riskLevel: "high" as const,
        features: [
          "Major currency pairs",
          "Basic trading strategies",
          "Monthly reports",
          "Email support",
          "Mobile app access",
        ],
        popular: false,
      },
      {
        name: "Professional",
        description: "Advanced forex strategies",
        category: "forex" as const,
        tier: "professional" as const,
        price: "2.5 ETH",
        priceUSD: "$4,250",
        apy: "15-25%",
        minAPY: 15,
        maxAPY: 25,
        minInvestment: 2500,
        maxInvestment: 25000,
        duration: 180,
        riskLevel: "high" as const,
        features: [
          "All major currency pairs",
          "Algorithmic trading",
          "Weekly reports",
          "Priority support",
          "Risk management systems",
          "Dedicated trader",
          "24/5 market access",
          "Early access to strategies",
        ],
        popular: true,
      },
      {
        name: "Enterprise",
        description: "Institutional forex management",
        category: "forex" as const,
        tier: "enterprise" as const,
        price: "12.5 ETH",
        priceUSD: "$21,250",
        apy: "18-30%",
        minAPY: 18,
        maxAPY: 30,
        minInvestment: 25000,
        maxInvestment: 250000,
        duration: 365,
        riskLevel: "high" as const,
        features: [
          "All Professional features",
          "Custom trading strategies",
          "Real-time monitoring",
          "24/7 dedicated support",
          "Institutional execution",
          "Custom reporting",
          "Direct trader access",
          "Exclusive opportunities",
        ],
        popular: false,
      },
    ];

    // Insert all plans
    const insertedPlans = [];
    for (const plan of plans) {
      const planId = await ctx.db.insert("investmentPlans", {
        ...plan,
        isActive: true,
        totalInvested: 0,
        totalInvestors: 0,
        createdAt: now,
        updatedAt: now,
      });
      insertedPlans.push(planId);
    }

    return { success: true, insertedCount: insertedPlans.length };
  },
});
