import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ================== USERS ==================
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    profilePic: v.optional(v.string()),
    bio: v.optional(v.string()),
    googleId: v.optional(v.string()),
    coins: v.number(),

    // streak
    answerStreak: v.number(),
    lastAnswerDate: v.optional(v.string()),
    bestStreak: v.number(),
    lastBestAnswerDate: v.optional(v.string()),

    role: v.string(),
    banned: v.boolean(), 

    createdAt: v.number(),
  }),

  // ================== CATEGORY ==================
  categories: defineTable({
    name: v.string(), 
    slug: v.string(), 
    createdAt: v.number(),
  }),

  // ================== POSTS ==================
  posts: defineTable({
    userId: v.id("users"),
    title: v.string(),
    body: v.string(),
    category: v.string(),
    bestAnswerId: v.optional(v.id("answers")),
    reported: v.boolean(), 
    hidden: v.boolean(),   
    createdAt: v.number(),
    imageStorageId: v.optional(v.id("_storage")),
  }),

  // ================== ANSWERS ==================
  answers: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
    body: v.string(),
    reported: v.boolean(),
    hidden: v.boolean(),
    createdAt: v.number(),
  }),

  // ================== STORE ITEMS ==================
  storeItems: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    type: v.string(), 
    createdAt: v.number(),
  }),

  // ================== USER ITEMS ==================
  userItems: defineTable({
    userId: v.id("users"),
    itemId: v.id("storeItems"),
    equipped: v.boolean(), 
    createdAt: v.number(),
  }),

  // ================== REPORTS ==================
  reports: defineTable({
    targetType: v.string(), 
    targetId: v.union(v.id("posts"), v.id("answers"), v.id("users")),
    reporterId: v.id("users"),
    reason: v.string(),
    status: v.string(), 
    createdAt: v.number(),
  }),

  files: defineTable({}),
});
