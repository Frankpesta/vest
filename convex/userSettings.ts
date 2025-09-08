import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { betterAuthComponent } from "./auth";

// Get user settings
export const getUserSettings = query({
  args: {},
  handler: async (ctx) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      return null;
    }

    // Get user profile for settings
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userMetadata.userId!))
      .first();

    // Return default settings if no profile exists
    if (!userProfile) {
      return {
        // Wallet Settings
        autoConnect: true,
        showBalance: true,
        
        // Security Settings
        twoFactorAuth: false,
        emailNotifications: true,
        smsNotifications: false,
        loginAlerts: true,
        
        // Privacy Settings
        profileVisibility: "private",
        dataSharing: false,
        analytics: true,
        
        // Display Settings
        theme: "system",
        language: "en",
        currency: "USD",
        timezone: "UTC-8",
        
        // Investment Settings
        riskTolerance: "medium",
        autoReinvest: false,
        investmentAlerts: true,
      };
    }

    // Return settings from user profile (extend userProfiles schema if needed)
    return {
      // Wallet Settings
      autoConnect: true,
      showBalance: true,
      
      // Security Settings
      twoFactorAuth: false,
      emailNotifications: true,
      smsNotifications: false,
      loginAlerts: true,
      
      // Privacy Settings
      profileVisibility: "private",
      dataSharing: false,
      analytics: true,
      
      // Display Settings
      theme: "system",
      language: "en",
      currency: "USD",
      timezone: "UTC-8",
      
      // Investment Settings
      riskTolerance: "medium",
      autoReinvest: false,
      investmentAlerts: true,
    };
  },
});

// Update user settings
export const updateUserSettings = mutation({
  args: {
    // Wallet Settings
    autoConnect: v.optional(v.boolean()),
    showBalance: v.optional(v.boolean()),
    
    // Security Settings
    twoFactorAuth: v.optional(v.boolean()),
    emailNotifications: v.optional(v.boolean()),
    smsNotifications: v.optional(v.boolean()),
    loginAlerts: v.optional(v.boolean()),
    
    // Privacy Settings
    profileVisibility: v.optional(v.union(
      v.literal("public"),
      v.literal("private"),
      v.literal("friends")
    )),
    dataSharing: v.optional(v.boolean()),
    analytics: v.optional(v.boolean()),
    
    // Display Settings
    theme: v.optional(v.union(
      v.literal("light"),
      v.literal("dark"),
      v.literal("system")
    )),
    language: v.optional(v.string()),
    currency: v.optional(v.string()),
    timezone: v.optional(v.string()),
    
    // Investment Settings
    riskTolerance: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    )),
    autoReinvest: v.optional(v.boolean()),
    investmentAlerts: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      throw new Error("Not authenticated");
    }

    // Find or create user profile
    let userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userMetadata.userId!))
      .first();

    const now = Date.now();

    if (userProfile) {
      // Update existing profile
      await ctx.db.patch(userProfile._id, {
        updatedAt: now,
      });
    } else {
      // Create new profile
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

    // For now, just return success
    // In the future, we could extend the userProfiles schema to include settings
    // or create a separate userSettings table
    
    return { success: true };
  },
});

// Change user password (placeholder - would integrate with Better Auth)
export const changePassword = mutation({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      throw new Error("Not authenticated");
    }

    // Validate password strength
    if (args.newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    // In a real implementation, this would:
    // 1. Verify current password with Better Auth
    // 2. Update password through Better Auth
    // For now, just return success
    
    return { success: true };
  },
});

// Enable/disable two-factor authentication (placeholder)
export const toggleTwoFactorAuth = mutation({
  args: {
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      throw new Error("Not authenticated");
    }

    // In a real implementation, this would:
    // 1. Generate 2FA secret if enabling
    // 2. Verify 2FA code
    // 3. Update user's 2FA status
    
    return { success: true, enabled: args.enabled };
  },
});

// Get user's active sessions (placeholder)
export const getActiveSessions = query({
  args: {},
  handler: async (ctx) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      return [];
    }

    // In a real implementation, this would return active sessions
    // For now, return a mock session
    return [
      {
        id: "current-session",
        device: "Chrome on Windows",
        location: "San Francisco, CA",
        ipAddress: "192.168.1.1",
        lastActive: Date.now(),
        isCurrent: true,
      },
    ];
  },
});

// Revoke session (placeholder)
export const revokeSession = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      throw new Error("Not authenticated");
    }

    // In a real implementation, this would revoke the session
    return { success: true };
  },
});
