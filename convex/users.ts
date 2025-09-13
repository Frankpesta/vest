import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { betterAuthComponent } from "./auth";

// Get current user profile (from Better Auth + extended profile data)
export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    // Get user data from Better Auth
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      return null;
    }

    // Get extended profile data if it exists
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userMetadata.userId!))
      .first();

    return {
      // Better Auth data
      id: userMetadata.userId,
      name: userMetadata.name || "User",
      email: userMetadata.email || "",
      emailVerified: userMetadata.emailVerified || false,
      image: userMetadata.image || "",
      
      // Extended profile data
      phoneNumber: userProfile?.phoneNumber || "",
      address: userProfile?.address || "",
      city: userProfile?.city || "",
      country: userProfile?.country || "",
      dateOfBirth: userProfile?.dateOfBirth || "",
      occupation: userProfile?.occupation || "",
      company: userProfile?.company || "",
      bio: userProfile?.bio || "",
      phoneVerified: userProfile?.phoneVerified || false,
      identityVerified: userProfile?.identityVerified || false,
      addressVerified: userProfile?.addressVerified || false,
      kycStatus: userProfile?.kycStatus || "not_submitted",
      role: userProfile?.role || "user",
      isActive: userProfile?.isActive ?? true,
      lastLoginAt: userProfile?.lastLoginAt,
      createdAt: userProfile?.createdAt || Date.now(),
      updatedAt: userProfile?.updatedAt || Date.now(),
    };
  },
});

// Get user role for authentication purposes
export const getUserRole = query({
  args: {},
  handler: async (ctx) => {
    // Get user data from Better Auth
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      return null;
    }

    // Get user profile to check role
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userMetadata.userId!))
      .first();

    return {
      userId: userMetadata.userId,
      role: userProfile?.role || "user",
      isActive: userProfile?.isActive ?? true,
    };
  },
});

// Set user role (admin only or for setup)
export const setUserRole = mutation({
  args: {
    userId: v.string(),
    role: v.union(v.literal("user"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    // Get current user to check if they're admin or if this is a setup call
    const currentUserMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!currentUserMetadata || !currentUserMetadata.userId) {
      throw new Error("Not authenticated");
    }

    // Check if current user is admin (unless they're setting their own role during setup)
    if (currentUserMetadata.userId !== args.userId) {
      const currentUserProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user_id", (q) => q.eq("userId", currentUserMetadata.userId!))
        .first();
      
      if (currentUserProfile?.role !== "admin") {
        throw new Error("Only admins can change user roles");
      }
    }

    // Find or create user profile
    let userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    const now = Date.now();

    if (userProfile) {
      // Update existing profile
      await ctx.db.patch(userProfile._id, {
        role: args.role,
        updatedAt: now,
      });
    } else {
      // Create new profile with specified role
      await ctx.db.insert("userProfiles", {
        userId: args.userId,
        role: args.role,
        phoneVerified: false,
        identityVerified: false,
        addressVerified: false,
        kycStatus: "not_submitted",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

// Update user profile
export const updateUserProfile = mutation({
  args: {
    name: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    occupation: v.optional(v.string()),
    company: v.optional(v.string()),
    bio: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get user from Better Auth
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      throw new Error("Not authenticated");
    }

    // Find existing profile or create new one
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userMetadata.userId!))
      .first();

    const now = Date.now();
    // Update only provided fields
    const updateData = Object.fromEntries(
      Object.entries(args).filter(([_, value]) => value !== undefined)
    );

    if (existingProfile) {
      // Update existing profile
      await ctx.db.patch(existingProfile._id, {
        ...updateData,
        updatedAt: now,
      });
    } else {
      // Create new profile
      await ctx.db.insert("userProfiles", {
        userId: userMetadata.userId!,
        phoneNumber: args.phoneNumber,
        address: args.address,
        city: args.city,
        country: args.country,
        dateOfBirth: args.dateOfBirth,
        occupation: args.occupation,
        company: args.company,
        bio: args.bio,
        image: args.image,
        name: args.name,
        phoneVerified: false,
        identityVerified: false,
        addressVerified: false,
        kycStatus: "not_submitted",
        role: "user",
        isActive: true,
        lastLoginAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

// Get user verification status
export const getUserVerificationStatus = query({
  args: {},
  handler: async (ctx) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      return null;
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userMetadata.userId!))
      .first();

    return {
      emailVerified: userMetadata.emailVerified || false,
      phoneVerified: userProfile?.phoneVerified || false,
      identityVerified: userProfile?.identityVerified || false,
      addressVerified: userProfile?.addressVerified || false,
      kycStatus: userProfile?.kycStatus || "not_submitted",
    };
  },
});

// Get user account statistics
export const getUserAccountStats = query({
  args: {},
  handler: async (ctx) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      return null;
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userMetadata.userId!))
      .first();

    // Get user's investments
    const investments = await ctx.db
      .query("investments")
      .withIndex("by_user", (q) => q.eq("userId", userMetadata.userId!))
      .collect();

    const activeInvestments = investments.filter(inv => inv.status === "active");
    const totalInvested = investments.reduce((sum, inv) => sum + inv.usdValue, 0);
    
    const portfolioValue = investments.reduce((sum, inv) => {
      return sum + inv.usdValue + (inv.actualReturn || 0);
    }, 0);

    const memberSince = userProfile?.createdAt || Date.now();

    return {
      memberSince: new Date(memberSince).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      }),
      totalInvestments: investments.length,
      activeInvestments: activeInvestments.length,
      totalInvested,
      portfolioValue,
      verificationLevel: userProfile?.identityVerified ? "Full" : 
                        userMetadata.emailVerified ? "Basic" : "None",
    };
  },
});

// Update user login timestamp
export const updateLastLogin = mutation({
  args: {},
  handler: async (ctx) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      return;
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userMetadata.userId!))
      .first();

    const now = Date.now();

    if (userProfile) {
      await ctx.db.patch(userProfile._id, {
        lastLoginAt: now,
        updatedAt: now,
      });
    } else {
      // Create profile if it doesn't exist
      await ctx.db.insert("userProfiles", {
        userId: userMetadata.userId!,
        phoneVerified: false,
        identityVerified: false,
        addressVerified: false,
        kycStatus: "not_submitted",
        role: "user",
        isActive: true,
        lastLoginAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Initialize user profile (called after first login)
export const initializeUserProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      throw new Error("Not authenticated");
    }

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userMetadata.userId!))
      .first();

    if (existingProfile) {
      return existingProfile._id;
    }

    // Create new user profile
    const now = Date.now();
    const profileId = await ctx.db.insert("userProfiles", {
      userId: userMetadata.userId,
      phoneNumber: undefined,
      address: undefined,
      city: undefined,
      country: undefined,
      dateOfBirth: undefined,
      occupation: undefined,
      company: undefined,
      bio: undefined,
      phoneVerified: false,
      identityVerified: false,
      addressVerified: false,
      kycStatus: "not_submitted",
      role: "user",
      isActive: true,
      lastLoginAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return profileId;
  },
});

// Update verification status (admin only)
export const updateVerificationStatus = mutation({
  args: {
    targetUserId: v.string(),
    phoneVerified: v.optional(v.boolean()),
    identityVerified: v.optional(v.boolean()),
    addressVerified: v.optional(v.boolean()),
    kycStatus: v.optional(v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("not_submitted")
    )),
  },
  handler: async (ctx, args) => {
    // Get current user from Better Auth
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      throw new Error("Not authenticated");
    }

    // Check if current user is admin
    const currentUserProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userMetadata.userId!))
      .first();

    if (!currentUserProfile || currentUserProfile.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Find target user profile
    const targetProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", args.targetUserId))
      .first();

    if (!targetProfile) {
      throw new Error("Target user profile not found");
    }

    // Update verification fields
    const updateData = Object.fromEntries(
      Object.entries({
        phoneVerified: args.phoneVerified,
        identityVerified: args.identityVerified,
        addressVerified: args.addressVerified,
        kycStatus: args.kycStatus,
      }).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(updateData).length > 0) {
      await ctx.db.patch(targetProfile._id, {
        ...updateData,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Get user profile by ID (admin only)
export const getUserProfileById = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Get current user from Better Auth
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      return null;
    }

    // Check if current user is admin
    const currentUserProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userMetadata.userId!))
      .first();

    if (!currentUserProfile || currentUserProfile.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Get target user profile
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    return userProfile;
  },
});

// Get all users (admin only, with pagination)
export const getAllUsers = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    role: v.optional(v.union(v.literal("user"), v.literal("admin"))),
    kycStatus: v.optional(v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("not_submitted")
    )),
  },
  handler: async (ctx, args) => {
    // Get current user from Better Auth
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      return null;
    }

    // Check if current user is admin
    const currentUserProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userMetadata.userId!))
      .first();

    if (!currentUserProfile || currentUserProfile.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Apply filters
    let query;
    if (args.role !== undefined) {
      const role = args.role;
      query = ctx.db.query("userProfiles").withIndex("by_role", (q) => q.eq("role", role));
    } else if (args.kycStatus !== undefined) {
      const kycStatus = args.kycStatus;
      query = ctx.db.query("userProfiles").withIndex("by_kyc_status", (q) => q.eq("kycStatus", kycStatus));
    } else {
      query = ctx.db.query("userProfiles").withIndex("by_created_at");
    }

    // Apply pagination
    const limit = args.limit || 50;
    const results = await query
      .order("desc")
      .paginate({
        numItems: limit,
        cursor: args.cursor || null,
      });

    return results;
  },
});

// Deactivate user account (admin only)
export const deactivateUser = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Get current user from Better Auth
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      throw new Error("Not authenticated");
    }

    // Check if current user is admin
    const currentUserProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userMetadata.userId!))
      .first();

    if (!currentUserProfile || currentUserProfile.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Find target user profile
    const targetProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (!targetProfile) {
      throw new Error("User profile not found");
    }

    // Deactivate user
    await ctx.db.patch(targetProfile._id, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Reactivate user account (admin only)
export const reactivateUser = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Get current user from Better Auth
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      throw new Error("Not authenticated");
    }

    // Check if current user is admin
    const currentUserProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userMetadata.userId!))
      .first();

    if (!currentUserProfile || currentUserProfile.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Find target user profile
    const targetProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (!targetProfile) {
      throw new Error("User profile not found");
    }

    // Reactivate user
    await ctx.db.patch(targetProfile._id, {
      isActive: true,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Set user as admin (for testing purposes - remove in production)
export const setUserAsAdmin = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Get current user from Better Auth
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      throw new Error("Not authenticated");
    }

    // Find target user profile
    const targetProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (!targetProfile) {
      throw new Error("User profile not found");
    }

    // Set user as admin
    await ctx.db.patch(targetProfile._id, {
      role: "admin",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get user statistics (admin only)
export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    // Get current user from Better Auth
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      return null;
    }

    // Check if current user is admin
    const currentUserProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userMetadata.userId!))
      .first();

    if (!currentUserProfile || currentUserProfile.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Get all users
    const allUsers = await ctx.db.query("userProfiles").collect();
    
    // Calculate statistics
    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter(u => u.isActive).length;
    const adminUsers = allUsers.filter(u => u.role === "admin").length;
    const verifiedUsers = allUsers.filter(u => u.identityVerified).length;
    const pendingKyc = allUsers.filter(u => u.kycStatus === "pending").length;
    const approvedKyc = allUsers.filter(u => u.kycStatus === "approved").length;
    
    // Get recent users (last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentUsers = allUsers.filter(u => u.createdAt > thirtyDaysAgo).length;

    return {
      totalUsers,
      activeUsers,
      adminUsers,
      verifiedUsers,
      pendingKyc,
      approvedKyc,
      recentUsers,
      inactiveUsers: totalUsers - activeUsers,
    };
  },
});

// Get user activity logs (admin only)
export const getUserActivityLogs = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get current user from Better Auth
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      return [];
    }

    // Check if current user is admin
    const currentUserProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userMetadata.userId!))
      .first();

    if (!currentUserProfile || currentUserProfile.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Get user's transactions, investments, and notifications as activity logs
    const limit = args.limit || 20;
    
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    const investments = await ctx.db
      .query("investments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    // Combine and sort all activities
    const activities = [
      ...transactions.map(t => ({ ...t, type: 'transaction' })),
      ...investments.map(i => ({ ...i, type: 'investment' })),
      ...notifications.map(n => ({ ...n, type: 'notification' })),
    ].sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);

    return activities;
  },
});

// Bulk update user status (admin only)
export const bulkUpdateUserStatus = mutation({
  args: {
    userIds: v.array(v.string()),
    action: v.union(
      v.literal("activate"),
      v.literal("deactivate"),
      v.literal("verify"),
      v.literal("reject_kyc")
    ),
  },
  handler: async (ctx, args) => {
    // Get current user from Better Auth
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      throw new Error("Not authenticated");
    }

    // Check if current user is admin
    const currentUserProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userMetadata.userId!))
      .first();

    if (!currentUserProfile || currentUserProfile.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const now = Date.now();
    const results = [];

    for (const userId of args.userIds) {
      const userProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user_id", (q) => q.eq("userId", userId))
        .first();

      if (userProfile) {
        let updateData: any = { updatedAt: now };
        
        switch (args.action) {
          case "activate":
            updateData.isActive = true;
            break;
          case "deactivate":
            updateData.isActive = false;
            break;
          case "verify":
            updateData.identityVerified = true;
            updateData.kycStatus = "approved";
            break;
          case "reject_kyc":
            updateData.kycStatus = "rejected";
            break;
        }

        await ctx.db.patch(userProfile._id, updateData);
        results.push({ userId, success: true });
      } else {
        results.push({ userId, success: false, error: "User not found" });
      }
    }

    return { results };
  },
});