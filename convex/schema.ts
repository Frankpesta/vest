import { defineTable, defineSchema } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	users: defineTable({
		name: v.string(),
		email: v.string(),
		phoneNumber: v.optional(v.string()),
		address: v.optional(v.string()),
	}),
});
