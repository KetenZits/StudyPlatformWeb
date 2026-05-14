import { query } from "./_generated/server";

// ─────────── Admin Dashboard Stats ───────────
export const getDashboardStats = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const posts = await ctx.db.query("posts").collect();
    const answers = await ctx.db.query("answers").collect();
    const pendingReports = await ctx.db
      .query("reports")
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
    const storeItems = await ctx.db.query("storeItems").collect();
    const achievements = await ctx.db.query("achievements").collect();
    const dailyQuests = await ctx.db
      .query("dailyQuests")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Total coins across all users
    const totalCoins = users.reduce((sum, u) => sum + (u.coins || 0), 0);

    // Banned users count
    const bannedUsers = users.filter((u) => u.banned).length;

    // Recent activities (last 10)
    const recentActivities = await ctx.db
      .query("activities")
      .order("desc")
      .collect();

    const enrichedActivities = await Promise.all(
      recentActivities.slice(0, 10).map(async (activity) => {
        const user = await ctx.db.get(activity.userId);
        return {
          ...activity,
          userName: user?.name ?? "Unknown",
          userPic: user?.profilePic ?? null,
        };
      })
    );

    // New users in last 7 days
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const newUsersThisWeek = users.filter((u) => u.createdAt >= sevenDaysAgo).length;

    // Posts this week
    const postsThisWeek = posts.filter((p) => p.createdAt >= sevenDaysAgo).length;

    return {
      totalUsers: users.length,
      totalPosts: posts.length,
      totalAnswers: answers.length,
      pendingReports: pendingReports.length,
      totalCoins,
      bannedUsers,
      storeItems: storeItems.length,
      achievements: achievements.length,
      activeQuests: dailyQuests.length,
      newUsersThisWeek,
      postsThisWeek,
      recentActivities: enrichedActivities,
    };
  },
});
