import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { betterAuthComponent } from "./auth";

// Get user's KYC submission
export const getUserKycSubmission = query({
  args: {},
  handler: async (ctx) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      return null;
    }

    const kycSubmission = await ctx.db
      .query("kycSubmissions")
      .withIndex("by_user", (q) => q.eq("userId", userMetadata.userId!))
      .first();

    return kycSubmission;
  },
});

// Create or update KYC submission
export const submitKyc = mutation({
  args: {
    documentType: v.union(
      v.literal("passport"),
      v.literal("drivers_license"),
      v.literal("national_id"),
      v.literal("state_id"),
      v.literal("military_id")
    ),
    documentNumber: v.string(),
    documentFrontImage: v.string(), // File ID
    documentBackImage: v.optional(v.string()), // File ID
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.string(), // ISO date string
    nationality: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    country: v.string(),
    postalCode: v.string(),
    addressProofType: v.union(
      v.literal("utility_bill"),
      v.literal("bank_statement"),
      v.literal("government_letter"),
      v.literal("rental_agreement"),
      v.literal("insurance_document")
    ),
    addressProofImage: v.string(), // File ID
  },
  handler: async (ctx, args) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();

    // Check if user already has a KYC submission
    const existingSubmission = await ctx.db
      .query("kycSubmissions")
      .withIndex("by_user", (q) => q.eq("userId", userMetadata.userId!))
      .first();

    if (existingSubmission) {
      // Update existing submission
      await ctx.db.patch(existingSubmission._id, {
        ...args,
        status: "pending",
        rejectionReason: undefined,
        reviewedBy: undefined,
        reviewedAt: undefined,
        adminNotes: undefined,
        updatedAt: now,
      });

      // Create notification for admin
      await ctx.db.insert("notifications", {
        userId: userMetadata.userId,
        type: "kyc",
        title: "KYC Resubmitted",
        message: "User has resubmitted their KYC documents for review.",
        priority: "medium",
        isRead: false,
        metadata: {
          kycSubmissionId: existingSubmission._id,
          action: "resubmitted",
        },
        createdAt: now,
      });

      return { submissionId: existingSubmission._id, isUpdate: true };
    } else {
      // Create new submission
      const submissionId = await ctx.db.insert("kycSubmissions", {
        userId: userMetadata.userId!,
        ...args,
        status: "pending",
        createdAt: now,
        updatedAt: now,
      });

      // Update user profile KYC status
      const userProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user_id", (q) => q.eq("userId", userMetadata.userId!))
        .first();

      if (userProfile) {
        await ctx.db.patch(userProfile._id, {
          kycStatus: "pending",
          updatedAt: now,
        });
      }

      // Create notification for admin
      await ctx.db.insert("notifications", {
        userId: userMetadata.userId,
        type: "kyc",
        title: "New KYC Submission",
        message: "A new KYC submission requires review.",
        priority: "high",
        isRead: false,
        metadata: {
          kycSubmissionId: submissionId,
          action: "submitted",
        },
        createdAt: now,
      });

      return { submissionId, isUpdate: false };
    }
  },
});

// Get all KYC submissions (admin only)
export const getAllKycSubmissions = query({
  args: {
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("under_review"),
      v.literal("approved"),
      v.literal("rejected")
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

    let query = ctx.db.query("kycSubmissions");

    if (args.status) {
      query = query.withIndex("by_status", (q) => q.eq("status", args.status!));
    } else {
      query = query.withIndex("by_created_at");
    }

    const limit = args.limit || 50;
    const submissions = await query
      .order("desc")
      .take(limit);

    return submissions;
  },
});

// Get KYC submission by ID (admin only)
export const getKycSubmissionById = query({
  args: { submissionId: v.id("kycSubmissions") },
  handler: async (ctx, args) => {
    // Check if user is admin
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      return null;
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userMetadata.userId!))
      .first();

    if (!userProfile || userProfile.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const submission = await ctx.db.get(args.submissionId);
    return submission;
  },
});

// Update KYC status (admin only)
export const updateKycStatus = mutation({
  args: {
    submissionId: v.id("kycSubmissions"),
    status: v.union(
      v.literal("under_review"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    rejectionReason: v.optional(v.string()),
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

    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new Error("KYC submission not found");
    }

    const now = Date.now();
    const updateData: any = {
      status: args.status,
      reviewedBy: userMetadata.userId,
      reviewedAt: now,
      updatedAt: now,
    };

    if (args.rejectionReason) {
      updateData.rejectionReason = args.rejectionReason;
    }

    if (args.adminNotes) {
      updateData.adminNotes = args.adminNotes;
    }

    await ctx.db.patch(args.submissionId, updateData);

    // Update user profile KYC status
    const targetUserProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", submission.userId))
      .first();

    if (targetUserProfile) {
      const kycStatus = args.status === "approved" ? "approved" : 
                       args.status === "rejected" ? "rejected" : "pending";
      
      await ctx.db.patch(targetUserProfile._id, {
        kycStatus,
        identityVerified: args.status === "approved",
        updatedAt: now,
      });
    }

    // Create notification for user
    await ctx.db.insert("notifications", {
      userId: submission.userId,
      type: "kyc",
      title: `KYC ${args.status.charAt(0).toUpperCase() + args.status.slice(1)}`,
      message: args.status === "approved" 
        ? "Your KYC verification has been approved. You can now make deposits and investments."
        : args.status === "rejected"
        ? `Your KYC verification was rejected. Reason: ${args.rejectionReason || "Please check your documents and resubmit."}`
        : "Your KYC submission is under review.",
      priority: args.status === "rejected" ? "high" : "medium",
      isRead: false,
      metadata: {
        kycSubmissionId: args.submissionId,
        status: args.status,
      },
      createdAt: now,
    });

    return { success: true };
  },
});

// Get KYC statistics (admin only)
export const getKycStats = query({
  args: {},
  handler: async (ctx) => {
    // Check if user is admin
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      return null;
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userMetadata.userId!))
      .first();

    if (!userProfile || userProfile.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const allSubmissions = await ctx.db.query("kycSubmissions").collect();
    
    const stats = {
      total: allSubmissions.length,
      pending: allSubmissions.filter(s => s.status === "pending").length,
      underReview: allSubmissions.filter(s => s.status === "under_review").length,
      approved: allSubmissions.filter(s => s.status === "approved").length,
      rejected: allSubmissions.filter(s => s.status === "rejected").length,
    };

    // Get recent submissions (last 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentSubmissions = allSubmissions.filter(s => s.createdAt > sevenDaysAgo).length;

    return {
      ...stats,
      recentSubmissions,
    };
  },
});

// Check if user can perform financial actions (deposits, investments, withdrawals)
export const canPerformFinancialActions = query({
  args: {},
  handler: async (ctx) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata || !userMetadata.userId) {
      return { canPerform: false, reason: "Not authenticated" };
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userMetadata.userId!))
      .first();

    if (!userProfile) {
      return { canPerform: false, reason: "User profile not found" };
    }

    if (!userProfile.isActive) {
      return { canPerform: false, reason: "Account is deactivated" };
    }

    if (userProfile.kycStatus !== "approved") {
      return { 
        canPerform: false, 
        reason: "KYC verification required",
        kycStatus: userProfile.kycStatus
      };
    }

    return { canPerform: true, reason: "All requirements met" };
  },
});

// Get supported document types
export const getSupportedDocumentTypes = query({
  args: {},
  handler: async () => {
    return [
      { value: "passport", label: "Passport", description: "International passport" },
      { value: "drivers_license", label: "Driver's License", description: "Valid driver's license" },
      { value: "national_id", label: "National ID", description: "Government-issued national ID" },
      { value: "state_id", label: "State ID", description: "State-issued identification" },
      { value: "military_id", label: "Military ID", description: "Military identification" },
    ];
  },
});

// Get supported address proof types
export const getSupportedAddressProofTypes = query({
  args: {},
  handler: async () => {
    return [
      { value: "utility_bill", label: "Utility Bill", description: "Electricity, water, gas, or internet bill" },
      { value: "bank_statement", label: "Bank Statement", description: "Recent bank statement with address" },
      { value: "government_letter", label: "Government Letter", description: "Official government correspondence" },
      { value: "rental_agreement", label: "Rental Agreement", description: "Lease or rental agreement" },
      { value: "insurance_document", label: "Insurance Document", description: "Insurance policy with address" },
    ];
  },
});
