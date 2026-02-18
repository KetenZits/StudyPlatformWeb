import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

// ─────────── Admin helper ───────────
async function requireAdmin(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ConvexError("Unauthorized");
  const user = await ctx.db
    .query("users")
    .filter((q: any) => q.eq(q.field("clerkId"), identity.subject))
    .first();
  if (!user || user.role !== "Admin") throw new ConvexError("Admin only");
  return user;
}

// 1. ดึงรายการสินค้าทั้งหมด (now with images)
export const getStoreItems = query({
  handler: async (ctx) => {
    const items = await ctx.db.query("storeItems").collect();
    const enriched = await Promise.all(
      items.map(async (item) => {
        let imageUrl: string | null = null;
        if (item.imageStorageId) {
          imageUrl = await ctx.storage.getUrl(item.imageStorageId);
        }
        return { ...item, imageUrl };
      })
    );
    return enriched;
  },
});

// 2. ดึงของที่ User คนนี้มี
export const getUserItems = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("userItems")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    const enrichedItems = await Promise.all(
      items.map(async (userItem) => {
        const itemDetails = await ctx.db.get(userItem.itemId);
        let imageUrl: string | null = null;
        if (itemDetails?.imageStorageId) {
          imageUrl = await ctx.storage.getUrl(itemDetails.imageStorageId);
        }
        return {
          ...userItem,
          details: itemDetails ? { ...itemDetails, imageUrl } : null,
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

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!user) throw new ConvexError("User not found");

    const item = await ctx.db.get(args.itemId);
    if (!item) throw new ConvexError("Item not found");

    const existingItem = await ctx.db
      .query("userItems")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .filter((q) => q.eq(q.field("itemId"), args.itemId))
      .first();

    if (existingItem) throw new ConvexError("You already own this item");

    if (user.coins < item.price) {
      throw new ConvexError("Not enough coins! 💸");
    }

    await ctx.db.patch(user._id, {
      coins: user.coins - item.price,
    });

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

    if (!userItem.equipped) {
      const allUserItems = await ctx.db
        .query("userItems")
        .filter((q) => q.eq(q.field("userId"), userItem.userId))
        .collect();

      for (const otherUserItem of allUserItems) {
        const otherDetails = await ctx.db.get(otherUserItem.itemId);
        if (otherDetails?.type === itemDetails.type && otherUserItem.equipped) {
          await ctx.db.patch(otherUserItem._id, { equipped: false });
        }
      }
    }

    await ctx.db.patch(userItem._id, {
      equipped: !userItem.equipped,
    });
  },
});

// ─────────── Admin: Upload URL ───────────
export const generateStoreUploadUrl = mutation(async ({ storage }) => {
  return await storage.generateUploadUrl();
});

// ─────────── Admin: Create Store Item ───────────
export const createStoreItem = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    type: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.insert("storeItems", {
      name: args.name,
      description: args.description,
      price: args.price,
      type: args.type,
      imageStorageId: args.imageStorageId,
      createdAt: Date.now(),
    });
  },
});

// ─────────── Admin: Update Store Item ───────────
export const updateStoreItem = mutation({
  args: {
    id: v.id("storeItems"),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    type: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new ConvexError("Item not found");

    // Delete old image if new one provided
    if (args.imageStorageId && existing.imageStorageId && args.imageStorageId !== existing.imageStorageId) {
      try { await ctx.storage.delete(existing.imageStorageId); } catch (e) { /* ignore */ }
    }

    await ctx.db.patch(args.id, {
      name: args.name,
      description: args.description,
      price: args.price,
      type: args.type,
      ...(args.imageStorageId !== undefined && { imageStorageId: args.imageStorageId }),
    });
  },
});

// ─────────── Admin: Delete Store Item ───────────
export const deleteStoreItem = mutation({
  args: { id: v.id("storeItems") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const item = await ctx.db.get(args.id);
    if (!item) throw new ConvexError("Item not found");

    // Delete image from storage
    if (item.imageStorageId) {
      try { await ctx.storage.delete(item.imageStorageId); } catch (e) { /* ignore */ }
    }

    // Delete associated user items
    const userItems = await ctx.db
      .query("userItems")
      .filter((q) => q.eq(q.field("itemId"), args.id))
      .collect();
    for (const ui of userItems) {
      await ctx.db.delete(ui._id);
    }

    await ctx.db.delete(args.id);
  },
});