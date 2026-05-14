import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─────────── Get My Notifications ───────────
export const getMyNotifications = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();
    if (!user) return [];

    const maxItems = limit ?? 20;

    const notifications = await ctx.db
      .query("notifications")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .order("desc")
      .collect();

    // Enrich with sender info
    const enriched = await Promise.all(
      notifications.slice(0, maxItems).map(async (noti) => {
        const fromUser = await ctx.db.get(noti.fromUserId);
        return {
          ...noti,
          fromUserName: fromUser?.name ?? "Unknown",
          fromUserPic: fromUser?.profilePic ?? null,
        };
      })
    );

    return enriched;
  },
});

// ─────────── Get Unread Count ───────────
export const getUnreadCount = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();
    if (!user) return 0;

    const unread = await ctx.db
      .query("notifications")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), user._id),
          q.eq(q.field("read"), false)
        )
      )
      .collect();

    return unread.length;
  },
});

// ─────────── Mark As Read ───────────
export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const noti = await ctx.db.get(notificationId);
    if (!noti) throw new Error("Notification not found");

    await ctx.db.patch(notificationId, { read: true });
    return { success: true };
  },
});

// ─────────── Mark All As Read ───────────
export const markAllAsRead = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();
    if (!user) throw new Error("User not found");

    const unread = await ctx.db
      .query("notifications")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), user._id),
          q.eq(q.field("read"), false)
        )
      )
      .collect();

    for (const noti of unread) {
      await ctx.db.patch(noti._id, { read: true });
    }

    return { success: true, count: unread.length };
  },
});
