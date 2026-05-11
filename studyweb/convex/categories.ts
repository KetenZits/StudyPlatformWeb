import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─────────── Admin helper ───────────
async function requireAdmin(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  const user = await ctx.db
    .query("users")
    .filter((q: any) => q.eq(q.field("clerkId"), identity.subject))
    .first();
  if (!user || (user.role !== "admin" && user.role !== "Admin" && user.role !== "developer" && user.role !== "Developer"))
    throw new Error("Admin or Developer only");
  return user;
}

// 1. Get all categories
export const getCategories = query({
  handler: async (ctx) => {
    return await ctx.db.query("categories").order("asc").collect();
  },
});

// 2. Create category (Admin)
export const createCategory = mutation({
  args: { name: v.string(), slug: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Check duplicate slug
    const existing = await ctx.db
      .query("categories")
      .filter((q) => q.eq(q.field("slug"), args.slug))
      .first();
    if (existing) throw new Error("Category with this slug already exists");

    await ctx.db.insert("categories", {
      name: args.name,
      slug: args.slug,
      createdAt: Date.now(),
    });
  },
});

// 3. Delete category (Admin)
export const deleteCategory = mutation({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.categoryId);
  },
});

// 4. Seed initial categories (Admin — one time)
export const seedCategories = mutation({
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const existing = await ctx.db.query("categories").collect();
    if (existing.length > 0) throw new Error("Categories already seeded");

    const defaults = [
      { name: "📐 Math", slug: "math" },
      { name: "🔬 Science", slug: "science" },
      { name: "📖 Thai", slug: "thai" },
      { name: "🌍 English", slug: "english" },
      { name: "🌏 Social", slug: "social" },
      { name: "💻 Computer", slug: "computer" },
      { name: "🎨 Art", slug: "art" },
      { name: "📚 Other", slug: "other" },
    ];

    for (const cat of defaults) {
      await ctx.db.insert("categories", {
        name: cat.name,
        slug: cat.slug,
        createdAt: Date.now(),
      });
    }
  },
});
