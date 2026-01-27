import { query } from "./_generated/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { time } from "console";

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
    if (!identity) throw new Error("Unauthorized");

    const user = await db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();

    if (!user) throw new Error("User not found");

    const now = new Date(); // เวลาปัจจุบันจริงๆ
    
    // บันทึก Answer ลง DB
    await db.insert("answers", {
      postId,
      userId: user._id,
      body,
      reported: false,
      hidden: false,
      createdAt: now.getTime(),
    });

    // --- เริ่ม LOGIC STREAK ใหม่ ---
    
    // 1. สร้าง Helper function เพื่อหาวันที่แบบตัดเวลาออก (เที่ยงคืนของวันนั้น)
    // ใช้ UTC เพื่อความชัวร์ หรือใช้ Local ตาม Server ก็ได้ แต่วิธีนี้จะไม่กระทบตัวแปร original
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
        // ตอบภายในวันเดียวกัน -> Streak เท่าเดิม
        newStreak = user.answerStreak;
      } else if (diffDays === 1) {
        // ตอบวันถัดมา (เมื่อวานตอบ วันนี้ตอบ) -> Streak + 1
        newStreak = user.answerStreak + 1;
      } else {
        // ห่างไปมากกว่า 1 วัน (เช่น ตอบมะรืน) -> Streak ขาด เริ่มนับ 1 ใหม่
        newStreak = 1;
      }
    } else {
      // ไม่เคยตอบมาก่อน เริ่มนับ 1
      newStreak = 1;
    }

    // --- คำนวณเวลาที่เหลือจนกว่าจะหมดวัน (Optional) ---
    // เป้าหมายคือบอกว่า "เหลือเวลาอีกกี่ชั่วโมงก่อนจะหมดวันนี้"
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0); // เที่ยงคืนของวันพรุ่งนี้
    const msLeft = nextMidnight.getTime() - now.getTime();
    
    const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));

    // Update User
    await db.patch(user._id, {
      answerStreak: newStreak,
      lastAnswerDate: now.toISOString(), // บันทึกเวลาปัจจุบันจริงๆ ไม่ใช่เที่ยงคืน
      bestStreak: Math.max(user.bestStreak || 0, newStreak),
    });

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

