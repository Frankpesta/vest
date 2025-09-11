import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Process email queue
export const processEmailQueue = mutation({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const now = Date.now();
    
    // Get pending emails that are ready to be sent
    const pendingEmails = await ctx.db
      .query("emailQueue")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .filter((q) => 
        q.or(
          q.eq(q.field("scheduledFor"), undefined),
          q.lte(q.field("scheduledFor"), now)
        )
      )
      .take(limit);

    const results = [];
    
    for (const email of pendingEmails) {
      try {
        // Here you would integrate with your email service
        // For now, we'll just mark as sent
        await ctx.db.patch(email._id, {
          status: "sent",
          sentAt: now,
        });
        
        // Update notification email status if linked
        if (email.notificationId) {
          await ctx.db.patch(email.notificationId, {
            emailSent: true,
            emailSentAt: now,
          });
        }
        
        results.push({ id: email._id, status: "sent" });
      } catch (error) {
        // Mark as failed and increment retry count
        const retryCount = email.retryCount + 1;
        const shouldRetry = retryCount < email.maxRetries;
        
        await ctx.db.patch(email._id, {
          status: shouldRetry ? "pending" : "failed",
          retryCount,
          errorMessage: error instanceof Error ? error.message : "Unknown error",
          scheduledFor: shouldRetry ? now + (retryCount * 60000) : undefined, // Retry in 1, 2, 3... minutes
        });
        
        results.push({ id: email._id, status: "failed", error: error instanceof Error ? error.message : "Unknown error" });
      }
    }
    
    return results;
  },
});

// Add email to queue
export const queueEmail = mutation({
  args: {
    to: v.string(),
    toName: v.optional(v.string()),
    templateName: v.optional(v.string()),
    subject: v.string(),
    htmlContent: v.string(),
    textContent: v.optional(v.string()),
    variables: v.optional(v.any()),
    priority: v.union(v.literal("low"), v.literal("normal"), v.literal("high"), v.literal("urgent")),
    scheduledFor: v.optional(v.number()),
    notificationId: v.optional(v.id("notifications")),
  },
  handler: async (ctx, args) => {
    const emailId = await ctx.db.insert("emailQueue", {
      ...args,
      status: "pending",
      retryCount: 0,
      maxRetries: 3,
      createdAt: Date.now(),
    });
    
    return emailId;
  },
});

// Get email queue status
export const getEmailQueueStatus = query({
  args: {},
  handler: async (ctx) => {
    const pending = await ctx.db
      .query("emailQueue")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    
    const sent = await ctx.db
      .query("emailQueue")
      .withIndex("by_status", (q) => q.eq("status", "sent"))
      .collect();
    
    const failed = await ctx.db
      .query("emailQueue")
      .withIndex("by_status", (q) => q.eq("status", "failed"))
      .collect();
    
    return {
      pending: pending.length,
      sent: sent.length,
      failed: failed.length,
      total: pending.length + sent.length + failed.length,
    };
  },
});

// Get recent emails
export const getRecentEmails = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    const emails = await ctx.db
      .query("emailQueue")
      .order("desc")
      .take(limit);
    
    return emails;
  },
});

// Retry failed emails
export const retryFailedEmails = mutation({
  args: {
    emailIds: v.array(v.id("emailQueue")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const results = [];
    
    for (const emailId of args.emailIds) {
      try {
        await ctx.db.patch(emailId, {
          status: "pending",
          retryCount: 0,
          errorMessage: undefined,
          scheduledFor: now,
        });
        
        results.push({ id: emailId, status: "requeued" });
      } catch (error) {
        results.push({ 
          id: emailId, 
          status: "error", 
          error: error instanceof Error ? error.message : "Unknown error" 
        });
      }
    }
    
    return results;
  },
});

// Delete old emails
export const cleanupOldEmails = mutation({
  args: {
    olderThanDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const olderThanDays = args.olderThanDays || 30;
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    
    const oldEmails = await ctx.db
      .query("emailQueue")
      .filter((q) => q.lt(q.field("createdAt"), cutoffTime))
      .collect();
    
    const deletedCount = oldEmails.length;
    
    for (const email of oldEmails) {
      await ctx.db.delete(email._id);
    }
    
    return { deletedCount };
  },
});
