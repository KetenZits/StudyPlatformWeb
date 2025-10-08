import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getUserByEmail = query(async ({ db, auth }) => {
  const identity = await auth.getUserIdentity();
  if (!identity) return null;

  // ใช้ email (มีใน schema)
  return await db
    .query("users")
    .filter((q) => q.eq(q.field("email"), identity.email))
    .first();
});

export const getCurrentUser = query(async ({ db, auth }) => {
  const identity = await auth.getUserIdentity();
  if (!identity) return null;

  // ใช้ clerkId เป็น key
  return await db
    .query("users")
    .filter(q => q.eq(q.field("clerkId"), identity.subject))
    .first();
});

// หรือถ้าใช้ clerkId แทน (จาก Clerk)
export const getUserByClerkId = query(async ({ db, auth }) => {
  const identity = await auth.getUserIdentity();
  if (!identity) return null;

  return await db
    .query("users")
    .filter((q) => q.eq(q.field("clerkId"), identity.subject))
    .first();
});

export const getTotalUsers = query(async ({ db }) => {
  const users = await db.query("users").collect();
  return users.length;
});

export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    profilePic: v.optional(v.string()),
    coins: v.number(),
    answerStreak: v.number(),
    bestStreak: v.number(),
    role: v.string(),
    banned: v.boolean(),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (existing) return existing;

    return await ctx.db.insert("users", {
      ...args,
      passwordHash: "", // ถ้า schema บังคับ
    });
  },
});


// --- UPDATE USER PROFILE ---
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    profilePic: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      ...(args.name && { name: args.name }),
      ...(args.bio && { bio: args.bio }),
      ...(args.profilePic && { profilePic: args.profilePic }),
    });

    return { success: true };
  },
});

export const updateProfilePic = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const url = await ctx.storage.getUrl(args.storageId);

    await ctx.db.patch(user._id, { profilePic: url ?? undefined });
    return { success: true, url };
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});