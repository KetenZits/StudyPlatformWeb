import { query } from "./_generated/server";

// ─────────── Categories (matching create post) ───────────
const CATEGORIES = [
    { id: "math", label: "Mathematics", emoji: "📐" },
    { id: "programming", label: "Programming", emoji: "💻" },
    { id: "biology", label: "Biology", emoji: "🧬" },
    { id: "physics", label: "Physics", emoji: "⚛️" },
    { id: "chemistry", label: "Chemistry", emoji: "🧪" },
    { id: "history", label: "History", emoji: "📚" },
    { id: "english", label: "English", emoji: "📖" },
    { id: "other", label: "Other", emoji: "🌟" },
];

const TOP_N = 10;

type UserEntry = {
    _id: string;
    name: string;
    profilePic?: string;
    score: number;
};

// ─────────── Main Leaderboard Query ───────────
export const getLeaderboards = query({
    handler: async ({ db }) => {
        // Load all needed data once
        const allUsers = await db.query("users").collect();
        const allPosts = await db.query("posts").collect();
        const allAnswers = await db.query("answers").collect();

        const nonBannedUsers = allUsers.filter((u) => !u.banned);

        // Helper: build a UserEntry
        const toEntry = (user: typeof allUsers[number], score: number): UserEntry => ({
            _id: user._id,
            name: user.name,
            profilePic: user.profilePic,
            score,
        });

        // Helper: sort & take top N
        const topN = (entries: UserEntry[]) =>
            entries.sort((a, b) => b.score - a.score).slice(0, TOP_N);

        // ─── 1. Most Answers ───
        const answerCountMap = new Map<string, number>();
        for (const ans of allAnswers) {
            answerCountMap.set(ans.userId, (answerCountMap.get(ans.userId) || 0) + 1);
        }
        const mostAnswers = topN(
            nonBannedUsers.map((u) => toEntry(u, answerCountMap.get(u._id) || 0))
        );

        // ─── 2. Best Streak ───
        const bestStreak = topN(
            nonBannedUsers.map((u) => toEntry(u, u.bestStreak || 0))
        );

        // ─── 3. Helpful Votes (total likes received) ───
        const likesCountMap = new Map<string, number>();
        for (const ans of allAnswers) {
            const likeCount = ans.likes?.length || 0;
            if (likeCount > 0) {
                likesCountMap.set(ans.userId, (likesCountMap.get(ans.userId) || 0) + likeCount);
            }
        }
        const helpfulVotes = topN(
            nonBannedUsers.map((u) => toEntry(u, likesCountMap.get(u._id) || 0))
        );

        // ─── 4. Best Answers ───
        const bestAnswerSet = new Set<string>();
        for (const post of allPosts) {
            if (post.bestAnswerId) bestAnswerSet.add(post.bestAnswerId);
        }
        const bestAnswerCountMap = new Map<string, number>();
        for (const ans of allAnswers) {
            if (bestAnswerSet.has(ans._id)) {
                bestAnswerCountMap.set(ans.userId, (bestAnswerCountMap.get(ans.userId) || 0) + 1);
            }
        }
        const bestAnswers = topN(
            nonBannedUsers.map((u) => toEntry(u, bestAnswerCountMap.get(u._id) || 0))
        );

        // ─── 5. Questions Asked ───
        const postCountMap = new Map<string, number>();
        for (const post of allPosts) {
            postCountMap.set(post.userId, (postCountMap.get(post.userId) || 0) + 1);
        }
        const questionsAsked = topN(
            nonBannedUsers.map((u) => toEntry(u, postCountMap.get(u._id) || 0))
        );

        // ─── 6. Most Coins ───
        const mostCoins = topN(
            nonBannedUsers.map((u) => toEntry(u, u.coins || 0))
        );

        // ─── 7. Per-Category Leaders (answers in posts of each category) ───
        // Build postId -> category map
        const postCategoryMap = new Map<string, string>();
        for (const post of allPosts) {
            postCategoryMap.set(post._id, post.category);
        }

        // Count answers per user per category
        const categoryAnswerMap = new Map<string, Map<string, number>>(); // category -> userId -> count
        for (const ans of allAnswers) {
            const cat = postCategoryMap.get(ans.postId);
            if (!cat) continue;
            if (!categoryAnswerMap.has(cat)) categoryAnswerMap.set(cat, new Map());
            const userMap = categoryAnswerMap.get(cat)!;
            userMap.set(ans.userId, (userMap.get(ans.userId) || 0) + 1);
        }

        const userMap = new Map(nonBannedUsers.map((u) => [u._id, u]));

        const byCategory = CATEGORIES.map((cat) => {
            const ansMap = categoryAnswerMap.get(cat.id);
            if (!ansMap) return { ...cat, leaders: [] as UserEntry[] };

            const entries: UserEntry[] = [];
            ansMap.forEach((count, userId) => {
                const user = userMap.get(userId as any);
                if (user) entries.push(toEntry(user, count));
            });

            return { ...cat, leaders: topN(entries) };
        });

        return {
            mostAnswers,
            bestStreak,
            helpfulVotes,
            bestAnswers,
            questionsAsked,
            mostCoins,
            byCategory,
        };
    },
});
