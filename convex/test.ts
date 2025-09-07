import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Simple test function to verify Convex is working
export const testConnection = query({
  args: {},
  handler: async (ctx) => {
    return {
      message: "Convex is working!",
      timestamp: Date.now(),
    };
  },
});

// Test function to create a test user (for development only)
export const createTestUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, { name, email }) => {
    const userId = await ctx.db.insert("users", {
      name,
      email,
      role: "user",
      emailVerified: false,
      phoneVerified: false,
      identityVerified: false,
      addressVerified: false,
      kycStatus: "not_submitted",
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { userId, success: true };
  },
});

// Test function to get all users (for development only)
export const getAllTestUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    }));
  },
});
