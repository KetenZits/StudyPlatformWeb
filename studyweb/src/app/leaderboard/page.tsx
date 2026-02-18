"use client";
import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
    Trophy, Flame, ThumbsUp, Star, HelpCircle, Coins,
    Crown, Medal, Award, Loader2, ChevronRight
} from "lucide-react";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

// ─── Categories matching create post ───
const CATEGORIES = [
    { id: "math", label: "Mathematics", emoji: "📐", color: "from-blue-500 to-cyan-500" },
    { id: "programming", label: "Programming", emoji: "💻", color: "from-purple-500 to-pink-500" },
    { id: "biology", label: "Biology", emoji: "🧬", color: "from-green-500 to-emerald-500" },
    { id: "physics", label: "Physics", emoji: "⚛️", color: "from-orange-500 to-red-500" },
    { id: "chemistry", label: "Chemistry", emoji: "🧪", color: "from-teal-500 to-cyan-500" },
    { id: "history", label: "History", emoji: "📚", color: "from-amber-500 to-yellow-500" },
    { id: "english", label: "English", emoji: "📖", color: "from-indigo-500 to-blue-500" },
    { id: "other", label: "Other", emoji: "🌟", color: "from-pink-500 to-rose-500" },
];

// ─── Board configs ───
const GLOBAL_BOARDS = [
    { key: "mostAnswers", title: "Most Answers", icon: HelpCircle, emoji: "✅", color: "from-blue-500 to-cyan-500", unit: "answers" },
    { key: "bestStreak", title: "Best Streak", icon: Flame, emoji: "🔥", color: "from-red-500 to-orange-500", unit: "days" },
    { key: "helpfulVotes", title: "Helpful Votes", icon: ThumbsUp, emoji: "👍", color: "from-pink-500 to-rose-500", unit: "votes" },
    { key: "bestAnswers", title: "Best Answers", icon: Star, emoji: "⭐", color: "from-yellow-500 to-amber-500", unit: "best" },
    { key: "questionsAsked", title: "Questions Asked", icon: HelpCircle, emoji: "❓", color: "from-purple-500 to-indigo-500", unit: "questions" },
    { key: "mostCoins", title: "Most Coins", icon: Coins, emoji: "💰", color: "from-amber-500 to-orange-600", unit: "coins" },
];

type UserEntry = {
    _id: string;
    name: string;
    profilePic?: string;
    score: number;
};

// ─── Rank Badge ───
function RankBadge({ rank }: { rank: number }) {
    if (rank === 1) return (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
            <Crown size={20} className="text-white" />
        </div>
    );
    if (rank === 2) return (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-lg">
            <Medal size={20} className="text-white" />
        </div>
    );
    if (rank === 3) return (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-lg">
            <Award size={20} className="text-white" />
        </div>
    );
    return (
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <span className="text-sm font-black text-gray-500">#{rank}</span>
        </div>
    );
}

// ─── Leaderboard Card ───
function LeaderboardCard({
    title, emoji, color, entries, unit, delay = 0,
}: {
    title: string; emoji: string; color: string;
    entries: UserEntry[]; unit: string; delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all"
        >
            {/* Header */}
            <div className={`bg-gradient-to-r ${color} px-6 py-4 flex items-center gap-3`}>
                <span className="text-2xl">{emoji}</span>
                <h3 className="text-lg font-bold text-white">{title}</h3>
            </div>

            {/* Entries */}
            <div className="p-4">
                {entries.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <Trophy size={32} className="mx-auto mb-2 opacity-40" />
                        <p className="text-sm font-medium">No data yet</p>
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        {entries.map((user, i) => (
                            <Link key={user._id} href={`/profile/${user._id}`}>
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: delay + i * 0.03 }}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer group
                    ${i === 0 ? "bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200" :
                                            i === 1 ? "bg-gray-50/80 border border-gray-100" :
                                                i === 2 ? "bg-amber-50/40 border border-amber-100" :
                                                    "hover:bg-gray-50"}`}
                                >
                                    <RankBadge rank={i + 1} />

                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4A574] to-[#B8873D] flex items-center justify-center shadow-md overflow-hidden shrink-0">
                                        {user.profilePic ? (
                                            <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-white font-bold text-xs">
                                                {user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate group-hover:text-amber-700 transition-colors">
                                            {user.name}
                                        </p>
                                    </div>

                                    <div className="shrink-0 text-right">
                                        <span className="text-lg font-black text-gray-900">{user.score.toLocaleString()}</span>
                                        <span className="text-xs text-gray-400 ml-1">{unit}</span>
                                    </div>

                                    <ChevronRight size={16} className="text-gray-300 group-hover:text-amber-500 transition-colors shrink-0" />
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// ─── Main Page ───
export default function LeaderboardPage() {
    const data = useQuery(api.leaderboard.getLeaderboards);
    const [tab, setTab] = useState<"overall" | "category">("overall");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    if (data === undefined) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-16 h-16 text-amber-600 animate-spin mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900">Loading Leaderboard...</h2>
                    </div>
                </div>
            </>
        );
    }

    const selectedCatData = selectedCategory
        ? data.byCategory.find((c) => c.id === selectedCategory)
        : null;

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 mt-15">
                {/* Decorative */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-yellow-300/20 to-amber-300/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-orange-300/20 to-yellow-300/20 rounded-full blur-3xl"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-24 md:pt-28 pb-16">
                    {/* Header */}
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-10">
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-200 mb-4">
                            <Trophy size={20} className="text-amber-600" />
                            <span className="text-sm font-bold text-amber-700">Top Performers</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-3 tracking-tight">
                            🏆 Leaderboard
                        </h1>
                        <p className="text-gray-600 text-lg font-medium max-w-xl mx-auto">
                            See who&apos;s leading the community across different categories
                        </p>
                    </motion.div>

                    {/* Tab Switcher */}
                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="flex justify-center mb-8"
                    >
                        <div className="inline-flex bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 shadow-lg border border-gray-100">
                            <button
                                onClick={() => setTab("overall")}
                                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${tab === "overall"
                                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                            >
                                🌟 Overall Rankings
                            </button>
                            <button
                                onClick={() => setTab("category")}
                                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${tab === "category"
                                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                            >
                                📚 By Category
                            </button>
                        </div>
                    </motion.div>

                    {/* Content */}
                    <AnimatePresence mode="wait">
                        {tab === "overall" ? (
                            <motion.div
                                key="overall"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {GLOBAL_BOARDS.map((board, i) => (
                                    <LeaderboardCard
                                        key={board.key}
                                        title={board.title}
                                        emoji={board.emoji}
                                        color={board.color}
                                        entries={(data as any)[board.key] || []}
                                        unit={board.unit}
                                        delay={i * 0.06}
                                    />
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="category"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                {/* Category Selector */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                                    {CATEGORIES.map((cat, i) => {
                                        const isActive = selectedCategory === cat.id;
                                        const catData = data.byCategory.find((c) => c.id === cat.id);
                                        const count = catData?.leaders.length || 0;

                                        return (
                                            <motion.button
                                                key={cat.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: i * 0.04 }}
                                                onClick={() => setSelectedCategory(isActive ? null : cat.id)}
                                                className={`relative p-4 rounded-2xl font-bold text-sm transition-all text-left
                          ${isActive
                                                        ? `bg-gradient-to-r ${cat.color} text-white shadow-lg scale-[1.02]`
                                                        : "bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md border border-gray-100"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xl">{cat.emoji}</span>
                                                    <span>{cat.label}</span>
                                                </div>
                                                <span className={`text-xs ${isActive ? "text-white/80" : "text-gray-400"}`}>
                                                    {count} participant{count !== 1 ? "s" : ""}
                                                </span>
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* Category Leaderboard */}
                                {selectedCategory && selectedCatData ? (
                                    <div className="max-w-2xl mx-auto">
                                        <LeaderboardCard
                                            title={`${selectedCatData.emoji} ${selectedCatData.label} — Top Helpers`}
                                            emoji={selectedCatData.emoji}
                                            color={CATEGORIES.find((c) => c.id === selectedCategory)?.color || "from-gray-500 to-gray-600"}
                                            entries={selectedCatData.leaders}
                                            unit="answers"
                                            delay={0.1}
                                        />
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-16"
                                    >
                                        <div className="text-5xl mb-4">📚</div>
                                        <h3 className="text-xl font-bold text-gray-500 mb-2">Select a Category</h3>
                                        <p className="text-gray-400">Choose a subject above to see the top helpers</p>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            <Footer />
        </>
    );
}
