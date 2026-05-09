import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserInternal } from "./users";

// YYYY-MM-DD
const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// 1. Get Quests for today for current user
export const getTodayQuests = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserInternal(ctx);
    if (!user) return [];

    const today = getTodayString();
    
    // Get all active global quests
    const activeQuests = await ctx.db
      .query("dailyQuests")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const questData = await Promise.all(activeQuests.map(async (quest) => {
      // Find user's progress for today
      const userQuest = await ctx.db
        .query("userDailyQuests")
        .filter((q) => q.and(
          q.eq(q.field("userId"), user._id),
          q.eq(q.field("questId"), quest._id),
          q.eq(q.field("date"), today)
        ))
        .first();

      return {
        ...quest,
        progress: userQuest?.progress || 0,
        completed: userQuest?.completed || false,
        claimedReward: userQuest?.claimedReward || false,
        userQuestId: userQuest?._id,
      };
    }));

    return questData;
  },
});

// 2. Claim Reward
export const claimReward = mutation({
  args: { questId: v.id("dailyQuests") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserInternal(ctx);
    if (!user) throw new Error("Not authenticated");

    const today = getTodayString();
    
    // Get the global quest
    const quest = await ctx.db.get(args.questId);
    if (!quest) throw new Error("Quest not found");

    // Get user progress
    const userQuest = await ctx.db
      .query("userDailyQuests")
      .filter((q) => q.and(
        q.eq(q.field("userId"), user._id),
        q.eq(q.field("questId"), args.questId),
        q.eq(q.field("date"), today)
      ))
      .first();

    if (!userQuest) throw new Error("No progress found for this quest today");
    if (!userQuest.completed) throw new Error("Quest not completed yet");
    if (userQuest.claimedReward) throw new Error("Reward already claimed");

    // 1. Mark as claimed
    await ctx.db.patch(userQuest._id, { claimedReward: true });

    // 2. Add coins
    await ctx.db.patch(user._id, { coins: user.coins + quest.reward });

    return { success: true, reward: quest.reward };
  },
});

// 3. Internal logic to update progress from other mutations
export const updateQuestProgressLogic = async (db: any, userId: any, type: string, amount: number) => {
  const today = getTodayString();

  // Find active quests of this type
  const quests = await db
    .query("dailyQuests")
    .filter((q: any) => q.and(
      q.eq(q.field("isActive"), true),
      q.eq(q.field("type"), type)
    ))
    .collect();

  for (const quest of quests) {
    // Find or create user quest record
    let userQuest = await db
      .query("userDailyQuests")
      .filter((q: any) => q.and(
        q.eq(q.field("userId"), userId),
        q.eq(q.field("questId"), quest._id),
        q.eq(q.field("date"), today)
      ))
      .first();

    if (!userQuest) {
      await db.insert("userDailyQuests", {
        userId: userId,
        questId: quest._id,
        date: today,
        progress: Math.min(amount, quest.target),
        completed: amount >= quest.target,
        claimedReward: false,
        createdAt: Date.now(),
      });
    } else if (!userQuest.completed) {
      const newProgress = Math.min(userQuest.progress + amount, quest.target);
      await db.patch(userQuest._id, {
        progress: newProgress,
        completed: newProgress >= quest.target
      });
    }
  }
};

// Also expose as mutation for testing or direct calling if needed
export const updateProgress = mutation({
  args: { 
    userId: v.id("users"),
    type: v.string(), // "answer_questions", "login_streak", etc.
    amount: v.number()
  },
  handler: async (ctx, args) => {
    await updateQuestProgressLogic(ctx.db, args.userId, args.type, args.amount);
  },
});

// ADMIN FUNCTIONS

export const getAllQuests = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("dailyQuests").order("desc").collect();
  },
});

export const createQuest = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    type: v.string(),
    target: v.number(),
    reward: v.number(),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserInternal(ctx);
    if (!user || user.role !== "admin") throw new Error("Unauthorized");

    await ctx.db.insert("dailyQuests", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const toggleQuestActive = mutation({
  args: { questId: v.id("dailyQuests"), isActive: v.boolean() },
  handler: async (ctx, args) => {
    const user = await getCurrentUserInternal(ctx);
    if (!user || user.role !== "admin") throw new Error("Unauthorized");

    await ctx.db.patch(args.questId, { isActive: args.isActive });
  },
});

export const deleteQuest = mutation({
  args: { questId: v.id("dailyQuests") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserInternal(ctx);
    if (!user || user.role !== "admin") throw new Error("Unauthorized");

    await ctx.db.delete(args.questId);
  },
});
