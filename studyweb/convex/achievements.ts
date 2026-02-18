import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─────────── Helper: ตรวจสอบว่าเป็น Admin ───────────
async function requireAdmin(ctx: any) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
        .query("users")
        .filter((q: any) => q.eq(q.field("clerkId"), identity.subject))
        .first();

    if (!user || user.role !== "Admin") throw new Error("Forbidden: Admin only");
    return user;
}

// ═══════════ QUERIES ═══════════

// 1. ดึง Achievement ทั้งหมด (พร้อม image URL)
export const getAllAchievements = query({
    handler: async (ctx) => {
        const achievements = await ctx.db.query("achievements").collect();

        const enriched = await Promise.all(
            achievements.map(async (a) => {
                let imageUrl: string | null = null;
                if (a.imageStorageId) {
                    imageUrl = await ctx.storage.getUrl(a.imageStorageId);
                }
                return { ...a, imageUrl };
            })
        );

        return enriched;
    },
});

// 2. ค้นหา User ด้วยชื่อ (สำหรับ assign)
export const searchUsers = query({
    args: { searchTerm: v.string() },
    handler: async (ctx, { searchTerm }) => {
        if (!searchTerm || searchTerm.trim().length === 0) return [];

        const allUsers = await ctx.db.query("users").collect();

        const term = searchTerm.toLowerCase();
        return allUsers
            .filter(
                (u) =>
                    u.name.toLowerCase().includes(term) ||
                    u.email.toLowerCase().includes(term)
            )
            .slice(0, 10)
            .map((u) => ({
                _id: u._id,
                name: u.name,
                email: u.email,
                profilePic: u.profilePic,
            }));
    },
});

// 3. ดึงรายชื่อ Users ที่ได้รับ Achievement นั้น
export const getAchievementUsers = query({
    args: { achievementId: v.id("achievements") },
    handler: async (ctx, { achievementId }) => {
        const userAchievements = await ctx.db
            .query("userAchievements")
            .filter((q) => q.eq(q.field("achievementId"), achievementId))
            .collect();

        const enriched = await Promise.all(
            userAchievements.map(async (ua) => {
                const user = await ctx.db.get(ua.userId);
                return {
                    _id: ua._id,
                    awardedAt: ua.awardedAt,
                    user: user
                        ? { _id: user._id, name: user.name, email: user.email, profilePic: user.profilePic }
                        : null,
                };
            })
        );

        return enriched;
    },
});

// 4. ดึง Achievements ของ User คนนั้น (สำหรับ profile)
export const getUserAchievements = query({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        const userAchievements = await ctx.db
            .query("userAchievements")
            .filter((q) => q.eq(q.field("userId"), userId))
            .collect();

        const enriched = await Promise.all(
            userAchievements.map(async (ua) => {
                const achievement = await ctx.db.get(ua.achievementId);
                let imageUrl: string | null = null;
                if (achievement?.imageStorageId) {
                    imageUrl = await ctx.storage.getUrl(achievement.imageStorageId);
                }
                return {
                    _id: ua._id,
                    awardedAt: ua.awardedAt,
                    achievement: achievement
                        ? {
                            _id: achievement._id,
                            name: achievement.name,
                            description: achievement.description,
                            condition: achievement.condition,
                            imageUrl,
                        }
                        : null,
                };
            })
        );

        return enriched;
    },
});

// ═══════════ MUTATIONS ═══════════

// 5. Generate upload URL สำหรับ achievement image
export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

// 6. สร้าง Achievement ใหม่
export const createAchievement = mutation({
    args: {
        name: v.string(),
        description: v.string(),
        condition: v.string(),
        imageStorageId: v.optional(v.id("_storage")),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);

        return await ctx.db.insert("achievements", {
            name: args.name,
            description: args.description,
            condition: args.condition,
            imageStorageId: args.imageStorageId,
            createdAt: Date.now(),
        });
    },
});

// 7. แก้ไข Achievement
export const updateAchievement = mutation({
    args: {
        id: v.id("achievements"),
        name: v.string(),
        description: v.string(),
        condition: v.string(),
        imageStorageId: v.optional(v.id("_storage")),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);

        const existing = await ctx.db.get(args.id);

        // ถ้ามีรูปใหม่ และรูปเก่ามีอยู่ → ลบรูปเก่า
        if (args.imageStorageId && existing?.imageStorageId && args.imageStorageId !== existing.imageStorageId) {
            try {
                await ctx.storage.delete(existing.imageStorageId);
            } catch (err) {
                console.warn("⚠️ old achievement image not found, skip delete");
            }
        }

        await ctx.db.patch(args.id, {
            name: args.name,
            description: args.description,
            condition: args.condition,
            ...(args.imageStorageId !== undefined && { imageStorageId: args.imageStorageId }),
        });

        return { success: true };
    },
});

// 8. ลบ Achievement (+ ลบ userAchievements + ลบ image ที่เกี่ยวข้อง)
export const deleteAchievement = mutation({
    args: { id: v.id("achievements") },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);

        const achievement = await ctx.db.get(args.id);

        // ลบรูปจาก storage ถ้ามี
        if (achievement?.imageStorageId) {
            try {
                await ctx.storage.delete(achievement.imageStorageId);
            } catch (err) {
                console.warn("⚠️ achievement image not found, skip delete");
            }
        }

        // ลบ userAchievements ที่เกี่ยวข้อง
        const related = await ctx.db
            .query("userAchievements")
            .filter((q) => q.eq(q.field("achievementId"), args.id))
            .collect();

        for (const ua of related) {
            await ctx.db.delete(ua._id);
        }

        await ctx.db.delete(args.id);
        return { success: true };
    },
});

// 9. มอบ Achievement ให้ User
export const awardAchievement = mutation({
    args: {
        userId: v.id("users"),
        achievementId: v.id("achievements"),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);

        // เช็คว่ามอบให้ไปแล้วหรือยัง
        const existing = await ctx.db
            .query("userAchievements")
            .filter((q) => q.eq(q.field("userId"), args.userId))
            .filter((q) => q.eq(q.field("achievementId"), args.achievementId))
            .first();

        if (existing) throw new Error("User already has this achievement");

        await ctx.db.insert("userAchievements", {
            userId: args.userId,
            achievementId: args.achievementId,
            awardedAt: Date.now(),
        });

        return { success: true };
    },
});

// 10. ยกเลิก Achievement จาก User
export const revokeAchievement = mutation({
    args: { userAchievementId: v.id("userAchievements") },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        await ctx.db.delete(args.userAchievementId);
        return { success: true };
    },
});
