import { query } from "./_generated/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const getAnswersByPostId = query({
  args: { postId: v.id("posts") },
  handler: async ({ db }, { postId }) => {
    const answers = await db
      .query("answers")
      .filter((q) => q.eq(q.field("postId"), postId))
      .collect();

    // map ข้อมูล user และ upvotes (จำลอง)
    const populated = await Promise.all(
      answers.map(async (answer) => {
        const author = await db.get(answer.userId);
        return {
          ...answer,
          author,
          upvotes: 0, // ยังไม่มีใน schema เลยใส่ default ไปก่อน
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
    if (!identity) throw new Error("Not authenticated");

    const user = await db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();

    if (!user) throw new Error("User not found");

    await db.insert("answers", {
      userId: user._id,
      postId,
      body,
      reported: false, // ค่า default
      hidden: false,   // ค่า default
      createdAt: Date.now(), // timestamp ปัจจุบัน
    });
  },
});

export const markAsBestAnswer = mutation({
  args: {
    postId: v.id("posts"),
    answerId: v.id("answers"),
  },
  handler: async ({ db, auth }, { postId, answerId }) => {
    // ตรวจสอบว่า user login
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // หาผู้ใช้
    const user = await db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user) throw new Error("User not found");

    // ดึงโพสต์มาเพื่อตรวจสอบว่าเป็นเจ้าของไหม
    const post = await db.get(postId);
    if (!post) throw new Error("Post not found");

    if (post.userId !== user._id) {
      throw new Error("You are not the owner of this post");
    }

    // อัปเดต post ให้มี bestAnswerId
    await db.patch(postId, {
      bestAnswerId: answerId,
    });

    // (Optional) เพิ่มเหรียญให้คนที่ตอบได้ถูกเลือก
    const answer = await db.get(answerId);
    if (answer) {
      const answerOwner = await db.get(answer.userId);
      if (answerOwner) {
        await db.patch(answerOwner._id, {
          coins: answerOwner.coins + 10, // สมมติ +10 เหรียญ
        });
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

    // ดึง likes เดิม ถ้ายังไม่มีให้ set เป็น array ว่าง
    const likes = answer.likes || [];

    const hasLiked = likes.includes(user._id);

    const updatedLikes = hasLiked
      ? likes.filter((id) => id !== user._id)
      : [...likes, user._id];

    await db.patch(answerId, { likes: updatedLikes });

    return { success: true, liked: !hasLiked };
  },
});
