import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getCommentsByAnswerId = query({
  args: { answerId: v.id("answers") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("answerComments")
      .filter((q) => q.eq(q.field("answerId"), args.answerId))
      .order("asc")
      .collect();

    const commentsWithUsers = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        return {
          ...comment,
          author: {
            name: user?.name,
            profilePic: user?.profilePic,
          },
        };
      })
    );

    return commentsWithUsers;
  },
});

export const createComment = mutation({
  args: {
    answerId: v.id("answers"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user) throw new Error("User not found");

    const answer = await ctx.db.get(args.answerId);
    if (!answer) throw new Error("Answer not found");

    const commentId = await ctx.db.insert("answerComments", {
      answerId: args.answerId,
      userId: user._id,
      body: args.body,
      createdAt: Date.now(),
    });

    // Notify the answer owner
    if (answer.userId !== user._id) {
      await ctx.db.insert("notifications", {
        userId: answer.userId,
        fromUserId: user._id,
        type: "new_comment", // Will fall back to default Bell icon in UI if not handled, which is fine, or we can add it later
        message: "replied to your answer.",
        relatedPostId: answer.postId,
        read: false,
        createdAt: Date.now(),
      });
    }

    return commentId;
  },
});

export const deleteComment = mutation({
  args: { commentId: v.id("answerComments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user) throw new Error("User not found");

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");

    const isAdmin = user.role === "admin" || user.role === "Admin" || user.role === "developer" || user.role === "Developer";
    if (comment.userId !== user._id && !isAdmin) throw new Error("Not authorized");

    await ctx.db.delete(args.commentId);
    return { success: true };
  },
});
