import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getUserByEmail = query(async ({ db, auth }) => {
  const identity = await auth.getUserIdentity();
  if (!identity) return null;

  return await db
    .query("users")
    .filter((q) => q.eq(q.field("email"), identity.email))
    .first();
});

export const getCurrentUserInternal = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const user = await ctx.db
    .query("users")
    .filter((q: any) => q.eq(q.field("clerkId"), identity.subject))
    .first();

  if (!user) return null;

  // ── Streak freshness check ──
  // ถ้า lastAnswerDate ห่างจากวันนี้มากกว่า 1 วัน → streak ถือว่าขาดแล้ว
  let isStreakActive = false;
  if (user.lastAnswerDate) {
    const now = new Date();
    const lastAnswer = new Date(user.lastAnswerDate);
    const getStartOfDay = (d: Date) => {
      const copy = new Date(d);
      copy.setHours(0, 0, 0, 0);
      return copy.getTime();
    };
    const diffDays = Math.floor(
      (getStartOfDay(now) - getStartOfDay(lastAnswer)) / (24 * 60 * 60 * 1000)
    );
    isStreakActive = diffDays <= 1;
  }

  return {
    ...user,
    isStreakActive,
    displayStreak: isStreakActive ? user.answerStreak : 0,
  };
};

export const getCurrentUser = query(async (ctx) => {
  return await getCurrentUserInternal(ctx);
});

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
      passwordHash: "",
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

    if (user.profilePicStorageId) {
      try {
        await ctx.storage.delete(user.profilePicStorageId);
      } catch (err) {
        console.warn("⚠️ old pic not found, skip delete");
      }
    }

    const url = await ctx.storage.getUrl(args.storageId);

    await ctx.db.patch(user._id, {
      profilePic: url ?? undefined,
      profilePicStorageId: args.storageId,
    });

    return { success: true, url };
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const getUserOverview = query({
  args: { userId: v.optional(v.string()) },
  handler: async ({ db }, { userId }) => {
    if (!userId) return null;

    const user = await db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), userId))
      .first();

    if (!user) throw new Error("User not found");

    const questions = await db
      .query("posts")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();
    const questionsCount = questions.length;

    const answers = await db
      .query("answers")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();
    const answersCount = answers.length;

    const bestAnswers = await db
      .query("posts")
      .filter((q) => q.not(q.eq(q.field("bestAnswerId"), null)))
      .collect();

    const bestCount = bestAnswers.filter(
      (post) => post.bestAnswerId && answers.find((a) => a._id === post.bestAnswerId)
    ).length;

    let helpfulVotes = 0;
    for (const ans of answers) {
      helpfulVotes += ans.likes ? ans.likes.length : 0;
    }

    return {
      questionsCount,
      answersCount,
      bestCount,
      helpfulVotes,
    };
  },
});

export const getUserRole = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    return user?.role;
  },
});

// ═══════════ PUBLIC PROFILE ═══════════

export const getUserPublicProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) return null;

    // Compute stats
    const questions = await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    const answers = await ctx.db
      .query("answers")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    const bestAnswerPosts = await ctx.db
      .query("posts")
      .filter((q) => q.not(q.eq(q.field("bestAnswerId"), null)))
      .collect();

    const bestCount = bestAnswerPosts.filter(
      (post) => post.bestAnswerId && answers.find((a) => a._id === post.bestAnswerId)
    ).length;

    let helpfulVotes = 0;
    for (const ans of answers) {
      helpfulVotes += ans.likes ? ans.likes.length : 0;
    }

    // Streak check
    let isStreakActive = false;
    if (user.lastAnswerDate) {
      const now = new Date();
      const lastAnswer = new Date(user.lastAnswerDate);
      const getStartOfDay = (d: Date) => {
        const copy = new Date(d);
        copy.setHours(0, 0, 0, 0);
        return copy.getTime();
      };
      const diffDays = Math.floor(
        (getStartOfDay(now) - getStartOfDay(lastAnswer)) / (24 * 60 * 60 * 1000)
      );
      isStreakActive = diffDays <= 1;
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      bio: user.bio,
      role: user.role,
      banned: user.banned,
      coins: user.coins,
      answerStreak: user.answerStreak,
      bestStreak: user.bestStreak,
      isStreakActive,
      displayStreak: isStreakActive ? user.answerStreak : 0,
      createdAt: user.createdAt,
      stats: {
        questionsCount: questions.length,
        answersCount: answers.length,
        bestCount,
        helpfulVotes,
      },
    };
  },
});

// ═══════════ BAN / UNBAN ═══════════

export const banUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const admin = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!admin || (admin.role !== "admin" && admin.role !== "Admin" && admin.role !== "developer" && admin.role !== "Developer")) throw new Error("Forbidden: Admin or Developer only");

    await ctx.db.patch(userId, { banned: true });
    return { success: true };
  },
});

export const unbanUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const admin = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!admin || (admin.role !== "admin" && admin.role !== "Admin" && admin.role !== "developer" && admin.role !== "Developer")) throw new Error("Forbidden: Admin or Developer only");

    await ctx.db.patch(userId, { banned: false });
    return { success: true };
  },
});

// ═══════════ ADMIN: GET ALL USERS ═══════════
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").order("desc").collect();
    return users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      profilePic: u.profilePic,
      role: u.role,
      coins: u.coins,
      answerStreak: u.answerStreak,
      bestStreak: u.bestStreak,
      banned: u.banned,
      createdAt: u.createdAt,
    }));
  },
});

// ═══════════ ADMIN: UPDATE USER ROLE ═══════════
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.string(),
  },
  handler: async (ctx, { userId, role }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const admin = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!admin || (admin.role !== "admin" && admin.role !== "Admin" && admin.role !== "developer" && admin.role !== "Developer"))
      throw new Error("Forbidden: Admin or Developer only");

    await ctx.db.patch(userId, { role });
    return { success: true };
  },
});