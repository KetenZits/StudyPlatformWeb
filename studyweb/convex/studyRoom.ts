import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserInternal } from "./users";
import { Id } from "./_generated/dataModel";

// Function to get today's date string in YYYY-MM-DD
const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// 1. Get Active Studiers (Real-time)
export const getActiveStudiers = query({
  args: {},
  handler: async (ctx) => {
    const activeSessions = await ctx.db
      .query("studySessions")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Fetch user details for each active session
    const studiers = await Promise.all(
      activeSessions.map(async (session) => {
        const user = await ctx.db.get(session.userId);
        return {
          userId: session.userId,
          name: user?.name || "Unknown Studier",
          profilePic: user?.profilePic,
          startedAt: session.startedAt,
        };
      })
    );

    return studiers;
  },
});

// 2. Start a study session
export const startSession = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserInternal(ctx);
    if (!user) throw new Error("Not authenticated");

    // Check if there's already an active session, if so, just return it
    const existing = await ctx.db
      .query("studySessions")
      .filter((q) => q.and(
        q.eq(q.field("userId"), user._id),
        q.eq(q.field("isActive"), true)
      ))
      .first();

    if (existing) return existing._id;

    // Create new session
    const sessionId = await ctx.db.insert("studySessions", {
      userId: user._id,
      startedAt: Date.now(),
      duration: 0,
      isActive: true,
      date: getTodayString(),
      createdAt: Date.now(),
    });

    return sessionId;
  },
});

// 3. End a study session
export const endSession = mutation({
  args: { 
    durationSeconds: v.number(), // The time actually studied before stopping/pausing
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserInternal(ctx);
    if (!user) throw new Error("Not authenticated");

    // Find active session
    const session = await ctx.db
      .query("studySessions")
      .filter((q) => q.and(
        q.eq(q.field("userId"), user._id),
        q.eq(q.field("isActive"), true)
      ))
      .first();

    if (session) {
      await ctx.db.patch(session._id, {
        isActive: false,
        duration: session.duration + args.durationSeconds,
      });
      return true;
    }
    
    // If no active session found (maybe they refreshed), just log the duration directly
    await ctx.db.insert("studySessions", {
      userId: user._id,
      startedAt: Date.now() - (args.durationSeconds * 1000),
      duration: args.durationSeconds,
      isActive: false,
      date: getTodayString(),
      createdAt: Date.now(),
    });

    return true;
  },
});

// 4. Get My Today's Stats
export const getMyTodayStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserInternal(ctx);
    if (!user) return { totalSeconds: 0, sessions: 0 };

    const today = getTodayString();
    const sessions = await ctx.db
      .query("studySessions")
      .filter((q) => q.and(
        q.eq(q.field("userId"), user._id),
        q.eq(q.field("date"), today)
      ))
      .collect();

    const totalSeconds = sessions.reduce((acc, curr) => acc + curr.duration, 0);

    return {
      totalSeconds,
      sessions: sessions.length,
    };
  },
});

// 5. Get Today's Leaderboard
export const getTodayLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const today = getTodayString();
    const allSessions = await ctx.db
      .query("studySessions")
      .filter((q) => q.eq(q.field("date"), today))
      .collect();

    // Group by userId and sum duration
    const userTotals = new Map<string, number>();
    allSessions.forEach(session => {
      const current = userTotals.get(session.userId) || 0;
      userTotals.set(session.userId, current + session.duration);
    });

    // Fetch user details and sort
    const leaderboard = await Promise.all(
      Array.from(userTotals.entries()).map(async ([userId, totalSeconds]) => {
        const user = await ctx.db.get(userId as Id<"users">);
        return {
          userId,
          name: user?.name || "Unknown",
          profilePic: user?.profilePic,
          totalSeconds,
        };
      })
    );

    // Sort descending by duration
    return leaderboard.sort((a, b) => b.totalSeconds - a.totalSeconds).slice(0, 10);
  },
});
