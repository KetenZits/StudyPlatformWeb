import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

// ─────────── Log Activity (internal helper) ───────────
export const logActivity = mutation({
    args: {
        userId: v.id("users"),
        type: v.string(),
        message: v.string(),
        relatedPostId: v.optional(v.id("posts")),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("activities", {
            userId: args.userId,
            type: args.type,
            message: args.message,
            relatedPostId: args.relatedPostId,
            createdAt: Date.now(),
        });
    },
});

// ─────────── Get Recent Activities ───────────
export const getRecentActivities = query({
    args: {
        userId: v.id("users"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, { userId, limit }) => {
        const maxItems = limit ?? 10;

        const activities = await ctx.db
            .query("activities")
            .filter((q) => q.eq(q.field("userId"), userId))
            .order("desc")
            .collect();

        // Get related post info for each activity
        const enriched = await Promise.all(
            activities.slice(0, maxItems).map(async (activity) => {
                let postTitle: string | null = null;
                if (activity.relatedPostId) {
                    const post = await ctx.db.get(activity.relatedPostId);
                    postTitle = post?.title ?? null;
                }
                return {
                    ...activity,
                    postTitle,
                };
            })
        );

        return enriched;
    },
});
