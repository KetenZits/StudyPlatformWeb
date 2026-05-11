import { query } from "./_generated/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { updateQuestProgressLogic } from "./dailyQuests";

export const getAnswersByPostId = query({
  args: { postId: v.id("posts") },
  handler: async ({ db }, { postId }) => {
    const answers = await db
      .query("answers")
      .filter((q) => q.eq(q.field("postId"), postId))
      .collect();

    const populated = await Promise.all(
      answers.map(async (answer) => {
        const author = await db.get(answer.userId);
        return {
          ...answer,
          author,
          upvotes: 0,
        };
      })
    );

    return populated;
  },
});


export const createAnswer = mutation({
  args: {
    postId: v.id("posts"),
    body: v.string(),
  },
  handler: async ({ db, auth }, { postId, body }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();

    if (!user) throw new Error("User not found");

    const now = new Date();

    await db.insert("answers", {
      postId,
      userId: user._id,
      body,
      reported: false,
      hidden: false,
      createdAt: now.getTime(),
    });

    // --- STREAK LOGIC ---
    const getStartOfDay = (date: Date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    };

    const currentDay = getStartOfDay(now);
    const lastAnswerDate = user.lastAnswerDate ? new Date(user.lastAnswerDate) : null;
    const lastAnswerDay = lastAnswerDate ? getStartOfDay(lastAnswerDate) : null;

    let newStreak = 1;
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    if (lastAnswerDay !== null) {
      const diffTime = currentDay - lastAnswerDay;
      const diffDays = Math.floor(diffTime / ONE_DAY_MS);

      if (diffDays === 0) {
        newStreak = user.answerStreak;
      } else if (diffDays === 1) {
        newStreak = user.answerStreak + 1;
      } else {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    const msLeft = nextMidnight.getTime() - now.getTime();

    const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));

    await db.patch(user._id, {
      answerStreak: newStreak,
      lastAnswerDate: now.toISOString(),
      bestStreak: Math.max(user.bestStreak || 0, newStreak),
    });

    // --- LOG ACTIVITY ---
    const post = await db.get(postId);
    const postTitle = post?.title ?? "a question";
    await db.insert("activities", {
      userId: user._id,
      type: "answered",
      message: `Answered a question: "${postTitle}"`,
      relatedPostId: postId,
      createdAt: Date.now(),
    });

    // --- UPDATE QUEST PROGRESS ---
    await updateQuestProgressLogic(db, user._id, "answer_questions", 1);

    return {
      success: true,
      streak: newStreak,
      timeLeft: {
        hoursLeft,
        minutesLeft
      },
    };
  },
});

export const markAsBestAnswer = mutation({
  args: {
    postId: v.id("posts"),
    answerId: v.id("answers"),
  },
  handler: async ({ db, auth }, { postId, answerId }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user) throw new Error("User not found");

    const post = await db.get(postId);
    if (!post) throw new Error("Post not found");

    if (post.userId !== user._id) {
      throw new Error("You are not the owner of this post");
    }

    await db.patch(postId, {
      bestAnswerId: answerId,
    });

    const answer = await db.get(answerId);
    if (answer) {
      const answerOwner = await db.get(answer.userId);
      if (answerOwner) {
        await db.patch(answerOwner._id, {
          coins: answerOwner.coins + 10,
        });

        // --- LOG ACTIVITY for answer owner ---
        await db.insert("activities", {
          userId: answerOwner._id,
          type: "best_answer",
          message: `Got Best Answer on: "${post.title}"`,
          relatedPostId: postId,
          createdAt: Date.now(),
        });

        // --- LOG ACTIVITY for coin earning ---
        await db.insert("activities", {
          userId: answerOwner._id,
          type: "earned_coins",
          message: `Earned 10 coins for Best Answer`,
          relatedPostId: postId,
          createdAt: Date.now(),
        });

        // --- UPDATE QUEST PROGRESS ---
        await updateQuestProgressLogic(db, answerOwner._id, "get_best_answer", 1);
      }
    }

    return { success: true };
  },
});

export const toggleLikeAnswer = mutation({
  args: {
    answerId: v.id("answers"),
  },
  handler: async ({ db, auth }, { answerId }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user) throw new Error("User not found");

    const answer = await db.get(answerId);
    if (!answer) throw new Error("Answer not found");

    const likes = answer.likes || [];

    const hasLiked = likes.includes(user._id);

    const updatedLikes = hasLiked
      ? likes.filter((id) => id !== user._id)
      : [...likes, user._id];

    await db.patch(answerId, { likes: updatedLikes });

    return { success: true, liked: !hasLiked };
  },
});

// ═══════════ DELETE ANSWER ═══════════
export const deleteAnswer = mutation({
  args: { answerId: v.id("answers") },
  handler: async ({ db, auth }, { answerId }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user) throw new Error("User not found");

    const answer = await db.get(answerId);
    if (!answer) throw new Error("Answer not found");

    const isAdmin = user.role === "admin" || user.role === "Admin" || user.role === "developer" || user.role === "Developer";
    if (answer.userId !== user._id && !isAdmin) throw new Error("Not authorized");

    // If this was the best answer, remove that reference
    const post = await db.get(answer.postId);
    if (post && post.bestAnswerId === answerId) {
      await db.patch(post._id, { bestAnswerId: undefined });
    }

    await db.delete(answerId);
    return { success: true };
  },
});

// ═══════════ UPDATE ANSWER ═══════════
export const updateAnswer = mutation({
  args: {
    answerId: v.id("answers"),
    body: v.string(),
  },
  handler: async ({ db, auth }, { answerId, body }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user) throw new Error("User not found");

    const answer = await db.get(answerId);
    if (!answer) throw new Error("Answer not found");

    if (answer.userId !== user._id) throw new Error("Only the author can edit");

    await db.patch(answerId, { body });
    return { success: true };
  },
});
