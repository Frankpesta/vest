import { defineTable, defineSchema } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	users: defineTable({
		name: v.string(),
		email: v.string(),
		phoneNumber: v.optional(v.string()),
		address: v.optional(v.string()),
		role: v.optional(v.union(v.literal("user"), v.literal("admin"))),
		emailVerified: v.optional(v.boolean()),
		image: v.optional(v.string()),
		createdAt: v.optional(v.string()),
	}),
});
