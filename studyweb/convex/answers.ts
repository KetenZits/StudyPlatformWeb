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
