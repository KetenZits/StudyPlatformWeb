import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

// 1. ดึงรายการสินค้าทั้งหมด
export const getStoreItems = query({
  handler: async (ctx) => {
    return await ctx.db.query("storeItems").collect();
  },
});

// 2. ดึงของที่ User คนนี้มี
export const getUserItems = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("userItems")
      // ✅ ถูกต้อง: ใช้ q.field("userId")
      .filter((q) => q.eq(q.field("userId"), args.userId)) 
      .collect();

    // Join เอาข้อมูล Item มาด้วย
    const enrichedItems = await Promise.all(
      items.map(async (userItem) => {
        const itemDetails = await ctx.db.get(userItem.itemId);
        return {
          ...userItem,
          details: itemDetails,
        };
      })
    );

    return enrichedItems;
  },
});

// 3. ซื้อสินค้า
export const buyItem = mutation({
  args: { itemId: v.id("storeItems") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    // หา User ปัจจุบัน
    const user = await ctx.db
      .query("users")
      // ✅ แก้ไข: ใช้ q.field("clerkId")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!user) throw new ConvexError("User not found");

    // หา Item ที่จะซื้อ
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new ConvexError("Item not found");

    // เช็คว่าเคยซื้อไปยัง
    const existingItem = await ctx.db
      .query("userItems")
      // ✅ แก้ไข: ใช้ q.field(...) ทั้ง 2 บรรทัด
      .filter((q) => q.eq(q.field("userId"), user._id))
      .filter((q) => q.eq(q.field("itemId"), args.itemId))
      .first();

    if (existingItem) throw new ConvexError("You already own this item");

    // เช็คเงิน
    if (user.coins < item.price) {
      throw new ConvexError("Not enough coins! 💸");
    }

    // หักเงิน
    await ctx.db.patch(user._id, {
      coins: user.coins - item.price,
    });

    // เพิ่มของเข้าตัว
    await ctx.db.insert("userItems", {
      userId: user._id,
      itemId: item._id,
      equipped: false,
      createdAt: Date.now(),
    });

    return { success: true, newBalance: user.coins - item.price };
  },
});

// 4. ใส่ของ / ถอดของ (Equip/Unequip)
export const toggleEquip = mutation({
  args: { userItemId: v.id("userItems") },
  handler: async (ctx, args) => {
    const userItem = await ctx.db.get(args.userItemId);
    if (!userItem) throw new ConvexError("Item not found");

    const itemDetails = await ctx.db.get(userItem.itemId);
    if (!itemDetails) throw new ConvexError("Item details missing");

    // ถ้าจะ "ใส่" (Equip) ต้องไปถอดของประเภทเดียวกันออกก่อน
    if (!userItem.equipped) {
      // หาของประเภทเดียวกันที่ใส่อยู่ (เช่น Badge เหมือนกัน)
      const allUserItems = await ctx.db
        .query("userItems")
        // ✅ แก้ไข: จุดที่ Error เดิมอยู่ตรงนี้ ต้องใช้ q.field("userId")
        .filter((q) => q.eq(q.field("userId"), userItem.userId))
        .collect();

      for (const otherUserItem of allUserItems) {
        const otherDetails = await ctx.db.get(otherUserItem.itemId);
        // ถ้าประเภทเดียวกัน และกำลังใส่อยู่ -> ถอดออก
        if (otherDetails?.type === itemDetails.type && otherUserItem.equipped) {
          await ctx.db.patch(otherUserItem._id, { equipped: false });
        }
      }
    }

    // สลับสถานะ (ถ้าใส่อยู่ก็ถอด ถ้าถอดอยู่ก็ใส่)
    await ctx.db.patch(userItem._id, {
      equipped: !userItem.equipped,
    });
  },
});