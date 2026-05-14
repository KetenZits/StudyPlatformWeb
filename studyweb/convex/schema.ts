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
    profilePicStorageId: v.optional(v.id("_storage")),
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
    likes: v.optional(v.array(v.id("users"))),
  }),

  // ================== ANSWER COMMENTS ==================
  answerComments: defineTable({
    answerId: v.id("answers"),
    userId: v.id("users"),
    body: v.string(),
    createdAt: v.number(),
  }),

  // ================== STORE ITEMS ==================
  storeItems: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    type: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
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

  // ================== ACHIEVEMENTS ==================
  achievements: defineTable({
    name: v.string(),
    description: v.string(),
    condition: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
  }),

  // ================== USER ACHIEVEMENTS ==================
  userAchievements: defineTable({
    userId: v.id("users"),
    achievementId: v.id("achievements"),
    awardedAt: v.number(),
  }),

  // ================== ACTIVITIES ==================
  activities: defineTable({
    userId: v.id("users"),
    type: v.string(),
    message: v.string(),
    relatedPostId: v.optional(v.id("posts")),
    createdAt: v.number(),
  }),

  // ================== STUDY SESSIONS ==================
  studySessions: defineTable({
    userId: v.id("users"),
    startedAt: v.number(),
    duration: v.number(),       // seconds studied
    isActive: v.boolean(),
    date: v.string(),           // "YYYY-MM-DD" for daily grouping
    createdAt: v.number(),
  }),

  // ================== DAILY QUESTS ==================
  dailyQuests: defineTable({
    title: v.string(),
    description: v.string(),
    type: v.string(),          // "answer_questions", "login_streak", "get_best_answer", "study_time", "like_answers"
    target: v.number(),        // e.g. answer 2 questions = target: 2
    reward: v.number(),        // coins reward
    emoji: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
  }),

  // ================== USER DAILY QUESTS ==================
  userDailyQuests: defineTable({
    userId: v.id("users"),
    questId: v.id("dailyQuests"),
    date: v.string(),          // "YYYY-MM-DD"
    progress: v.number(),
    completed: v.boolean(),
    claimedReward: v.boolean(),
    createdAt: v.number(),
  }),

  // ================== NOTIFICATIONS ==================
  notifications: defineTable({
    userId: v.id("users"),
    fromUserId: v.id("users"),
    type: v.string(),          // "new_answer" | "best_answer" | "like_answer"
    message: v.string(),
    relatedPostId: v.optional(v.id("posts")),
    read: v.boolean(),
    createdAt: v.number(),
  }),
});
