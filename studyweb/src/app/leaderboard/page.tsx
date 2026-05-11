"use client";
import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Flame, ThumbsUp, Star, HelpCircle, Coins, Crown, Medal, Award, Loader2, ChevronRight } from "lucide-react";
import Link from "next/link";
import Sidebar from "../../../components/Sidebar";
import Footer from "../../../components/Footer";

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

const GLOBAL_BOARDS = [
  { key: "mostAnswers", title: "Most Answers", icon: HelpCircle, emoji: "✅", color: "from-blue-500 to-cyan-500", unit: "answers" },
  { key: "bestStreak", title: "Best Streak", icon: Flame, emoji: "🔥", color: "from-red-500 to-orange-500", unit: "days" },
  { key: "helpfulVotes", title: "Helpful Votes", icon: ThumbsUp, emoji: "👍", color: "from-pink-500 to-rose-500", unit: "votes" },
  { key: "bestAnswers", title: "Best Answers", icon: Star, emoji: "⭐", color: "from-yellow-500 to-amber-500", unit: "best" },
  { key: "questionsAsked", title: "Questions Asked", icon: HelpCircle, emoji: "❓", color: "from-purple-500 to-indigo-500", unit: "questions" },
  { key: "mostCoins", title: "Most Coins", icon: Coins, emoji: "💰", color: "from-amber-500 to-orange-600", unit: "coins" },
];

type UserEntry = { _id: string; name: string; profilePic?: string; score: number; };

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)', boxShadow: '3px 3px 6px #a3b1c6, -3px -3px 6px #ffffff' }}><Crown size={20} className="text-white" /></div>;
  if (rank === 2) return <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #9ca3af, #6b7280)', boxShadow: '3px 3px 6px #a3b1c6, -3px -3px 6px #ffffff' }}><Medal size={20} className="text-white" /></div>;
  if (rank === 3) return <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #d97706, #b45309)', boxShadow: '3px 3px 6px #a3b1c6, -3px -3px 6px #ffffff' }}><Award size={20} className="text-white" /></div>;
  return <div className="w-10 h-10 rounded-xl nm-inset-xs flex items-center justify-center"><span className="text-sm font-black text-gray-500">#{rank}</span></div>;
}

function LeaderboardCard({ title, emoji, color, entries, unit, delay = 0 }: { title: string; emoji: string; color: string; entries: UserEntry[]; unit: string; delay?: number; }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="nm-raised overflow-hidden transition-all">
      <div className={`bg-gradient-to-r ${color} px-6 py-4 flex items-center gap-3`}><span className="text-2xl">{emoji}</span><h3 className="text-lg font-bold text-white">{title}</h3></div>
      <div className="p-4">
        {entries.length === 0 ? (
          <div className="text-center py-8 text-gray-400"><Trophy size={32} className="mx-auto mb-2 opacity-40" /><p className="text-sm font-medium">No data yet</p></div>
        ) : (
          <div className="space-y-1.5">{entries.map((user, i) => (
            <Link key={user._id} href={`/profile/${user._id}`}>
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: delay + i * 0.03 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all mt-2 cursor-pointer group ${i < 3 ? "nm-flat" : "hover:bg-white/30"}`}>
                <RankBadge rank={i + 1} />
                <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', boxShadow: '2px 2px 4px #a3b1c6, -2px -2px 4px #ffffff' }}>
                  {user.profilePic ? <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" /> : <span className="text-white font-bold text-xs">{user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}</span>}
                </div>
                <div className="flex-1 min-w-0"><p className="text-sm font-bold text-gray-800 truncate group-hover:text-purple-600 transition-colors">{user.name}</p></div>
                <div className="shrink-0 text-right"><span className="text-lg font-black text-gray-800">{user.score.toLocaleString()}</span><span className="text-xs text-gray-400 ml-1">{unit}</span></div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-purple-500 transition-colors shrink-0" />
              </motion.div>
            </Link>
          ))}</div>
        )}
      </div>
    </motion.div>
  );
}

export default function LeaderboardPage() {
  const data = useQuery(api.leaderboard.getLeaderboards);
  const [tab, setTab] = useState<"overall" | "category">("overall");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (data === undefined) {
    return (<><Sidebar /><div className="min-h-screen bg-[#e0e5ec] flex items-center justify-center lg:pl-[280px]"><div className="text-center"><Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" /><h2 className="text-2xl font-bold text-gray-800">Loading Leaderboard...</h2></div></div></>);
  }

  const selectedCatData = selectedCategory ? data.byCategory.find((c) => c.id === selectedCategory) : null;

  return (<><Sidebar /><div className="min-h-screen bg-[#e0e5ec] lg:pl-[280px]">
    <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-20 md:pt-12 pb-16">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-10">
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl nm-raised mb-4"><Trophy size={20} className="text-purple-500" /><span className="text-sm font-bold text-purple-600">Top Performers</span></div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-800 mb-3 tracking-tight">🏆 Leaderboard</h1>
        <p className="text-gray-500 text-lg font-medium max-w-xl mx-auto">See who&apos;s leading the community</p>
      </motion.div>

      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex justify-center mb-8">
        <div className="inline-flex rounded-2xl p-1.5 nm-raised">
          <button onClick={() => setTab("overall")} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${tab === "overall" ? "nm-gradient-btn" : "text-gray-500 hover:text-gray-800"}`}>🌟 Overall Rankings</button>
          <button onClick={() => setTab("category")} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${tab === "category" ? "nm-gradient-btn" : "text-gray-500 hover:text-gray-800"}`}>📚 By Category</button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {tab === "overall" ? (
          <motion.div key="overall" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GLOBAL_BOARDS.map((board, i) => <LeaderboardCard key={board.key} title={board.title} emoji={board.emoji} color={board.color} entries={(data as any)[board.key] || []} unit={board.unit} delay={i * 0.06} />)}
          </motion.div>
        ) : (
          <motion.div key="category" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {CATEGORIES.map((cat, i) => {
                const isActive = selectedCategory === cat.id;
                const count = data.byCategory.find((c) => c.id === cat.id)?.leaders.length || 0;
                return (
                  <motion.button key={cat.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }} onClick={() => setSelectedCategory(isActive ? null : cat.id)}
                    className={`relative p-4 rounded-2xl font-bold text-sm transition-all text-left ${isActive ? `bg-gradient-to-r ${cat.color} text-white` : "nm-raised text-gray-600"}`}
                    style={isActive ? { boxShadow: '4px 4px 10px #a3b1c6' } : {}}>
                    <div className="flex items-center gap-2 mb-1"><span className="text-xl">{cat.emoji}</span><span>{cat.label}</span></div>
                    <span className={`text-xs ${isActive ? "text-white/80" : "text-gray-400"}`}>{count} participants</span>
                  </motion.button>
                );
              })}
            </div>
            {selectedCategory && selectedCatData ? (
              <div className="max-w-2xl mx-auto"><LeaderboardCard title={`${selectedCatData.emoji} ${selectedCatData.label} — Top Helpers`} emoji={selectedCatData.emoji} color={CATEGORIES.find((c) => c.id === selectedCategory)?.color || "from-gray-500 to-gray-600"} entries={selectedCatData.leaders} unit="answers" delay={0.1} /></div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16"><div className="text-5xl mb-4">📚</div><h3 className="text-xl font-bold text-gray-500 mb-2">Select a Category</h3><p className="text-gray-400">Choose a subject above to see the top helpers</p></motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div><Footer /></>);
}
