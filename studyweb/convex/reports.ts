import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { getCurrentUserInternal } from "./users";

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

// 1. Create Report
export const createReport = mutation({
  args: {
    targetType: v.string(), // "post" | "answer" | "user"
    targetId: v.union(v.id("posts"), v.id("answers"), v.id("users")),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserInternal(ctx);
    if (!user) throw new Error("Not authenticated");

    // Check if user already reported this target
    const existing = await ctx.db
      .query("reports")
      .filter((q) => q.and(
        q.eq(q.field("reporterId"), user._id),
        q.eq(q.field("targetId"), args.targetId)
      ))
      .first();

    if (existing) throw new Error("You already reported this");

    await ctx.db.insert("reports", {
      targetType: args.targetType,
      targetId: args.targetId,
      reporterId: user._id,
      reason: args.reason,
      status: "pending",
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// 2. Get All Reports (Admin)
export const getReports = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let reports;
    if (args.status) {
      reports = await ctx.db
        .query("reports")
        .filter((q) => q.eq(q.field("status"), args.status))
        .order("desc")
        .collect();
    } else {
      reports = await ctx.db.query("reports").order("desc").collect();
    }

    // Enrich with reporter info and target content
    const enriched = await Promise.all(
      reports.map(async (report) => {
        const reporter = await ctx.db.get(report.reporterId);
        let targetContent: string | null = null;
        let targetAuthor: string | null = null;

        try {
          if (report.targetType === "post") {
            const post = await ctx.db.get(report.targetId as Id<"posts">);
            targetContent = (post as any)?.title ?? "[Deleted Post]";
            if (post) {
              const author = await ctx.db.get((post as any).userId);
              targetAuthor = (author as any)?.name ?? "Unknown";
            }
          } else if (report.targetType === "answer") {
            const answer = await ctx.db.get(report.targetId as Id<"answers">);
            targetContent = (answer as any)?.body?.slice(0, 100) ?? "[Deleted Answer]";
            if (answer) {
              const author = await ctx.db.get((answer as any).userId);
              targetAuthor = (author as any)?.name ?? "Unknown";
            }
          } else if (report.targetType === "user") {
            const targetUser = await ctx.db.get(report.targetId as Id<"users">);
            targetContent = (targetUser as any)?.name ?? "[Deleted User]";
            targetAuthor = (targetUser as any)?.email ?? "";
          }
        } catch (_e) {
          targetContent = "[Content not found]";
        }

        return {
          ...report,
          reporterName: reporter?.name ?? "Unknown",
          reporterEmail: reporter?.email ?? "",
          targetContent,
          targetAuthor,
        };
      })
    );

    return enriched;
  },
});

// 3. Resolve Report (Admin)
export const resolveReport = mutation({
  args: {
    reportId: v.id("reports"),
    action: v.string(), // "approve" | "dismiss"
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const report = await ctx.db.get(args.reportId);
    if (!report) throw new Error("Report not found");

    if (args.action === "approve") {
      // Hide the reported content
      if (report.targetType === "post") {
        const post = await ctx.db.get(report.targetId as any);
        if (post) await ctx.db.patch(post._id, { hidden: true, reported: true });
      } else if (report.targetType === "answer") {
        const answer = await ctx.db.get(report.targetId as any);
        if (answer) await ctx.db.patch(answer._id, { hidden: true, reported: true });
      } else if (report.targetType === "user") {
        const targetUser = await ctx.db.get(report.targetId as any);
        if (targetUser) await ctx.db.patch(targetUser._id, { banned: true });
      }
    }

    await ctx.db.patch(args.reportId, {
      status: args.action === "approve" ? "resolved" : "dismissed",
    });

    return { success: true };
  },
});

// 4. Get pending report count (for sidebar badge)
export const getPendingCount = query({
  handler: async (ctx) => {
    const pending = await ctx.db
      .query("reports")
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
    return pending.length;
  },
});
