import { mutation, query } from "./_generated/server";

// ✅ Query user จาก DB
export const getCurrentUser = query(async ({ db, auth }) => {
  const identity = await auth.getUserIdentity();
  if (!identity) return null;

  return await db
    .query("users")
    .filter(q => q.eq(q.field("clerkId"), identity.subject))
    .first();
});

// ✅ Create user ใหม่
export const createUser = mutation(
  async ({ db, auth }, { name }: { name: string }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await db
      .query("users")
      .filter(q => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (existing) return existing;

    return await db.insert("users", {
        clerkId: identity.subject,
        email: identity.email!,       // จาก JWT claim
        name: name || identity.name!, // จาก JWT claim
        profilePic: identity.profilePic ? String(identity.profilePic) : undefined,
        coins: 0,
        passwordHash: "",      // 👈 เพิ่ม
        answerStreak: 0,       // 👈 เพิ่ม
        bestStreak: 0,         // 👈 เพิ่ม
        role: "user",          // 👈 เพิ่ม
        banned: false,         // 👈 เพิ่ม
        createdAt: Date.now(),
    });
  }
);
