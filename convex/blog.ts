import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { betterAuthComponent } from "./auth";

// Get all published blog posts (public)
export const getPublishedBlogPosts = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("blogPosts")
      .withIndex("by_status", (q) => q.eq("status", "published"));

    if (args.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.category));
    }

    if (args.featured !== undefined) {
      query = query.filter((q) => q.eq(q.field("isFeatured"), args.featured));
    }

    const limit = args.limit || 20;
    const posts = await query
      .order("desc")
      .take(limit);

    return posts;
  },
});

// Get blog post by slug (public)
export const getBlogPostBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .filter((q) => q.eq(q.field("status"), "published"))
      .first();

    if (!post) {
      return null;
    }

    return post;
  },
});

// Get blog categories (public)
export const getBlogCategories = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    const categories = [...new Set(posts.map(post => post.category))];
    return categories;
  },
});

// Get blog statistics (public)
export const getBlogStats = query({
  args: {},
  handler: async (ctx) => {
    const allPosts = await ctx.db.query("blogPosts").collect();
    const publishedPosts = allPosts.filter(post => post.status === "published");
    
    return {
      totalPosts: publishedPosts.length,
      totalViews: publishedPosts.reduce((sum, post) => sum + post.viewCount, 0),
      totalLikes: publishedPosts.reduce((sum, post) => sum + post.likeCount, 0),
      categories: [...new Set(publishedPosts.map(post => post.category))].length,
    };
  },
});

// Get all blog posts (admin only)
export const getAllBlogPosts = query({
  args: {
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    )),
    category: v.optional(v.string()),
    authorId: v.optional(v.string()),
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

    const limit = args.limit || 100;

    if (args.status) {
      return await ctx.db
        .query("blogPosts")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(limit);
    } else if (args.category) {
      return await ctx.db
        .query("blogPosts")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .order("desc")
        .take(limit);
    } else if (args.authorId) {
      return await ctx.db
        .query("blogPosts")
        .withIndex("by_author", (q) => q.eq("authorId", args.authorId!))
        .order("desc")
        .take(limit);
    } else {
      return await ctx.db
        .query("blogPosts")
        .withIndex("by_created_at")
        .order("desc")
        .take(limit);
    }
  },
});

// Get blog post by ID (admin only)
export const getBlogPostById = query({
  args: { postId: v.id("blogPosts") },
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

    return await ctx.db.get(args.postId);
  },
});

// Create blog post (admin only)
export const createBlogPost = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(),
    featuredImage: v.optional(v.string()),
    category: v.string(),
    tags: v.array(v.string()),
    authorId: v.string(),
    authorName: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
    readTime: v.optional(v.number()),
    isFeatured: v.boolean(),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
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
    const publishedAt = args.status === "published" ? now : undefined;

    const postId = await ctx.db.insert("blogPosts", {
      title: args.title,
      slug: args.slug,
      excerpt: args.excerpt,
      content: args.content,
      featuredImage: args.featuredImage,
      category: args.category,
      tags: args.tags,
      authorId: args.authorId,
      authorName: args.authorName,
      status: args.status,
      publishedAt,
      readTime: args.readTime,
      viewCount: 0,
      likeCount: 0,
      isFeatured: args.isFeatured,
      seoTitle: args.seoTitle,
      seoDescription: args.seoDescription,
      createdAt: now,
      updatedAt: now,
    });

    return postId;
  },
});

// Update blog post (admin only)
export const updateBlogPost = mutation({
  args: {
    postId: v.id("blogPosts"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    featuredImage: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    )),
    readTime: v.optional(v.number()),
    isFeatured: v.optional(v.boolean()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
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

    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Blog post not found");
    }

    const now = Date.now();
    const updateData: any = {
      updatedAt: now,
    };

    // Update fields if provided
    if (args.title !== undefined) updateData.title = args.title;
    if (args.slug !== undefined) updateData.slug = args.slug;
    if (args.excerpt !== undefined) updateData.excerpt = args.excerpt;
    if (args.content !== undefined) updateData.content = args.content;
    if (args.featuredImage !== undefined) updateData.featuredImage = args.featuredImage;
    if (args.category !== undefined) updateData.category = args.category;
    if (args.tags !== undefined) updateData.tags = args.tags;
    if (args.readTime !== undefined) updateData.readTime = args.readTime;
    if (args.isFeatured !== undefined) updateData.isFeatured = args.isFeatured;
    if (args.seoTitle !== undefined) updateData.seoTitle = args.seoTitle;
    if (args.seoDescription !== undefined) updateData.seoDescription = args.seoDescription;

    // Handle status change
    if (args.status !== undefined) {
      updateData.status = args.status;
      if (args.status === "published" && !post.publishedAt) {
        updateData.publishedAt = now;
      }
    }

    await ctx.db.patch(args.postId, updateData);
    return { success: true };
  },
});

// Delete blog post (admin only)
export const deleteBlogPost = mutation({
  args: { postId: v.id("blogPosts") },
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

    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Blog post not found");
    }

    await ctx.db.delete(args.postId);
    return { success: true };
  },
});

// Like blog post (public)
export const likeBlogPost = mutation({
  args: { postId: v.id("blogPosts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Blog post not found");
    }

    await ctx.db.patch(args.postId, {
      likeCount: post.likeCount + 1,
    });

    return { success: true };
  },
});

// Get blog post statistics (admin only)
export const getBlogPostStats = query({
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

    const allPosts = await ctx.db.query("blogPosts").collect();
    
    const stats = {
      total: allPosts.length,
      draft: allPosts.filter(p => p.status === "draft").length,
      published: allPosts.filter(p => p.status === "published").length,
      archived: allPosts.filter(p => p.status === "archived").length,
      featured: allPosts.filter(p => p.isFeatured).length,
      totalViews: allPosts.reduce((sum, p) => sum + p.viewCount, 0),
      totalLikes: allPosts.reduce((sum, p) => sum + p.likeCount, 0),
    };

    return stats;
  },
});
