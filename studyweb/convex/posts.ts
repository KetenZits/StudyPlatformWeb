import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { query } from "./_generated/server";


export const createPost = mutation({
  args: {
    title: v.string(),
    body: v.string(),
    category: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();

    if (!user) throw new Error("User not found");

    const postId = await ctx.db.insert("posts", {
      userId: user._id,
      title: args.title,
      body: args.body,
      category: args.category,
      bestAnswerId: undefined,
      reported: false,
      hidden: false,
      createdAt: Date.now(),
      imageStorageId: args.imageStorageId,
    });

    // --- LOG ACTIVITY ---
    await ctx.db.insert("activities", {
      userId: user._id,
      type: "posted",
      message: `Asked a question: "${args.title}"`,
      relatedPostId: postId,
      createdAt: Date.now(),
    });

    return postId;
  },
});

export const getAllPosts = query(async ({ db, storage }) => {
  const posts = await db.query("posts").collect();

  const postsWithDetails = await Promise.all(
    posts.map(async (post) => {
      const user = await db.get(post.userId);

      let imageUrl = null;
      if (post.imageStorageId) {
        imageUrl = await storage.getUrl(post.imageStorageId);
      }

      const answers = await db
        .query("answers")
        .filter((q) => q.eq(q.field("postId"), post._id))
        .collect();

      return {
        ...post,
        imageUrl,
        username: user?.name || "Anonymous",
        avatar: user?.profilePic || "👤",
        answersCount: answers.length,
      };
    })
  );

  return postsWithDetails;
});



export const getPostsRecent = query(async ({ db, storage }) => {
  const posts = await db
    .query("posts")
    .order("desc")
    .collect();

  const postsWithImages = await Promise.all(
    posts.map(async (post) => {
      let imageUrl = null;
      if (post.imageStorageId) {
        imageUrl = await storage.getUrl(post.imageStorageId);
      }

      const answers = await db
        .query("answers")
        .filter((q) => q.eq(q.field("postId"), post._id))
        .collect();

      const user = await db.get(post.userId);
      return { ...post, imageUrl, username: user?.name, profilePic: user?.profilePic, answersCount: answers.length, };
    })
  );

  return postsWithImages;
});

export const generateUploadUrl = mutation(async ({ storage }) => {
  return await storage.generateUploadUrl();
});

export const getTotalPosts = query(async ({ db }) => {
  const posts = await db.query("posts").collect();
  return posts.length;
});


export const getPostById = query({
  args: { postId: v.id("posts") },
  handler: async ({ db, storage }, { postId }) => {
    const post = await db.get(postId);
    if (!post) return null;

    const author = await db.get(post.userId);

    let imageUrl = null;
    if (post.imageStorageId) {
      imageUrl = await storage.getUrl(post.imageStorageId);
    }

    return {
      ...post,
      author,
      imageUrl,
    };
  },
});

// ═══════════ DELETE POST ═══════════
export const deletePost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user) throw new Error("User not found");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    const isAdmin = user.role === "admin" || user.role === "Admin" || user.role === "developer" || user.role === "Developer";
    if (post.userId !== user._id && !isAdmin) throw new Error("Not authorized");

    // Delete associated answers and their comments
    const answers = await ctx.db
      .query("answers")
      .filter((q) => q.eq(q.field("postId"), args.postId))
      .collect();
    for (const answer of answers) {
      const comments = await ctx.db
        .query("answerComments")
        .filter((q) => q.eq(q.field("answerId"), answer._id))
        .collect();
      for (const comment of comments) {
        await ctx.db.delete(comment._id);
      }
      await ctx.db.delete(answer._id);
    }

    // Delete post image from storage
    if (post.imageStorageId) {
      try { await ctx.storage.delete(post.imageStorageId); } catch (_e) { /* ignore */ }
    }

    await ctx.db.delete(args.postId);
    return { success: true };
  },
});

// ═══════════ UPDATE POST ═══════════
export const updatePost = mutation({
  args: {
    postId: v.id("posts"),
    title: v.string(),
    body: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user) throw new Error("User not found");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    if (post.userId !== user._id) throw new Error("Only the author can edit this post");

    await ctx.db.patch(args.postId, {
      title: args.title,
      body: args.body,
      category: args.category,
    });

    return { success: true };
  },
});