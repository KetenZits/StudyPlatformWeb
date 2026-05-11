"use client";
import { MessageCircle, ChevronRight, ArrowRight, Sparkles, TrendingUp, Award, Clock, Store } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { api } from "../../convex/_generated/api";
import { useQuery } from "convex/react";
import Link from "next/link";
import Marquee from "react-fast-marquee";
import { Target } from "lucide-react";

export default function Index() {

  const currentUser = useQuery(api.users.getCurrentUser);
  const postsrecent = useQuery(api.posts.getPostsRecent);
  const todayQuests = useQuery(api.dailyQuests.getTodayQuests);

  const timeLeft = React.useMemo(() => {
    if (!currentUser?.lastAnswerDate) return null;

    const lastAnswerDate = new Date(currentUser.lastAnswerDate);
    const now = new Date();
    const nextMidnight = new Date(lastAnswerDate);
    nextMidnight.setDate(nextMidnight.getDate() + 1);
    nextMidnight.setHours(24, 0, 0, 0);

    const msLeft = nextMidnight.getTime() - now.getTime();

    return {
      hoursLeft: Math.floor(msLeft / (1000 * 60 * 60)),
      minutesLeft: Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60))
    };
  }, [currentUser?.lastAnswerDate]);

  const paths = [
    { icon: TrendingUp, emoji: "🔥", title: "Hot Questions", subtitle: "Trending now", color: "from-orange-500 to-red-500", link: "/posts" },
    { icon: Clock, emoji: "🕒", title: "Recent", subtitle: "Latest posts", color: "from-blue-500 to-cyan-500", link: "/posts" },
    { icon: Award, emoji: "🏆", title: "Leaderboard", subtitle: "Top contributors", color: "from-purple-500 to-pink-500", link: "/leaderboard" },
    { icon: Store, emoji: "🛒", title: "Store", subtitle: "Redeem rewards", color: "from-green-500 to-emerald-500", link: "/store" },
  ];

  const stats = [
    {
      emoji: "🔥",
      label: "Your Streak",
      value: currentUser?.answerStreak ?? 0,
      subtext: "Streak",
      highlight: false
    },
    {
      emoji: "⭐",
      label: "Best Answer Streak",
      value: currentUser?.bestStreak ?? 0,
      subtext: "In a row",
      highlight: false
    },
    {
      emoji: "💰",
      label: "Coins",
      value: currentUser?.coins ?? 0,
      subtext: "Let spend now",
      highlight: true
    },
  ];



  return (
    <>
      <Sidebar />
      <div className="min-h-screen bg-[#e0e5ec] pt-20 lg:pt-8 lg:pl-[280px]">

        {/* Main Container - Web Layout */}
        <div className="max-w-7xl mx-auto px-8 py-10">

          {/* Header Section - Full Width */}
          <div className="mb-12">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">👋</span>
                  <span className="text-lg text-gray-600 font-medium">
                    Hello,{" "}
                    <span className="font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent text-xl">
                      {currentUser?.name ?? "There"}
                    </span>
                  </span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-black text-gray-800 mb-3 tracking-tight">
                  Welcome To <span className="bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 bg-clip-text text-transparent">NeuroSync</span>
                </h1>

                <p className="text-gray-500 text-lg font-medium">
                  Let&apos;s continue your learning journey and keep Streak ✨
                </p>
              </div>
            </motion.div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

            {/* Left Column - Main Content (2/3) */}
            <div className="lg:col-span-2 space-y-8">

              {/* Ask Question Card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -4 }}
                className="p-10 rounded-3xl relative overflow-hidden cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #6366f1, #3b82f6)',
                  boxShadow: '8px 8px 20px #a3b1c6, -8px -8px 20px #ffffff'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles size={32} className="text-white" />
                    <h2 className="text-3xl font-bold text-white">
                      Have a Question?
                    </h2>
                  </div>

                  <p className="text-white/95 text-lg font-medium mb-6">
                    Ask the community and get instant answers from experts
                  </p>

                  <Link href={'/posts/create'}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white hover:bg-gray-50 transition-all group cursor-pointer"
                      style={{ boxShadow: '4px 4px 10px rgba(0,0,0,0.15)' }}
                    >
                      <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                        Ask Now
                      </span>
                      <ArrowRight size={22} className="text-purple-600 group-hover:translate-x-2 transition-transform" />
                    </motion.button>
                  </Link>
                </div>
              </motion.div>

              {/* Quick Access Grid */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Access</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {paths.map((path, i) => (
                    <Link key={i} href={path.link}>
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 + i * 0.05 }}
                        whileHover={{ scale: 1.03, y: -4 }}
                        whileTap={{ scale: 0.97 }}
                        className="relative flex items-center gap-5 rounded-2xl p-6 nm-raised transition-all group overflow-hidden"
                      >
                        <div className="text-5xl transform group-hover:scale-110 transition-transform">
                          {path.emoji}
                        </div>

                        <div className="flex flex-col items-start flex-1">
                          <span className="text-lg font-bold text-gray-800 mb-1">
                            {path.title}
                          </span>
                          <span className="text-sm text-gray-500 font-medium">
                            {path.subtitle}
                          </span>
                        </div>

                        <ChevronRight className="text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" size={24} />
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recent Questions */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Recent Questions</h2>
                  <Link href={'/posts'}>
                    <button className="text-base font-bold text-purple-600 hover:text-purple-800 transition-colors px-4 py-2 rounded-xl hover:bg-purple-50/30 cursor-pointer">
                      View All →
                    </button>
                  </Link>
                </div>

                <div className="space-y-4 flex flex-row justify-between h-full">
                  <Marquee pauseOnHover={true} gradient={true} speed={50} gradientColor="#e0e5ec" gradientWidth={50}>
                    {postsrecent?.slice(0, 5).map((post, i) => (
                      <motion.div
                        key={post._id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 + i * 0.08 }}
                        whileHover={{ y: -3 }}
                        className="nm-raised p-6 transition-all cursor-pointer group w-96 mx-5"
                      >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex flex-col gap-3 flex-1">
                            {/* Profile */}
                            <div className="flex items-center gap-3">
                              {post.profilePic ? (
                                <img
                                  src={post.profilePic}
                                  alt={post.username || "User"}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
                                  style={{ boxShadow: '2px 2px 5px #a3b1c6, -2px -2px 5px #ffffff' }}
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', boxShadow: '2px 2px 5px #a3b1c6, -2px -2px 5px #ffffff' }}
                                >
                                  {post.username?.[0]?.toUpperCase() ?? "U"}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-gray-800 text-sm">{post.username ?? "Anonymous"}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>

                            {/* Category */}
                            <div className="flex items-center gap-3 mt-1">
                              <div className="px-3 py-1.5 rounded-xl nm-inset-xs">
                                <span className="text-xs font-bold text-purple-700">
                                  {post.category}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <h3 className="text-xl font-bold text-gray-800 leading-tight mb-2 group-hover:text-purple-600 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-base text-gray-500 leading-relaxed line-clamp-3">
                          {post.body.length > 40
                            ? (
                              <>
                                {post.body.slice(0, 40)}
                                <span className="text-gray-700 font-bold">...</span>
                              </>
                            )
                            : post.body}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-300/40 mt-4">
                          <div className="flex items-center gap-2 px-4 py-2 rounded-xl nm-inset-xs">
                            <MessageCircle size={18} className="text-purple-500" />
                            <span className="text-sm font-bold text-purple-600">
                              {post.answersCount ?? 0} answers
                            </span>
                          </div>

                          <Link href={`/posts/${post._id}`}>
                            <div className="w-10 h-10 rounded-xl nm-btn flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-purple-500 group-hover:to-blue-500 transition-all">
                              <ChevronRight
                                size={20}
                                className="text-purple-500 group-hover:text-white transition-colors"
                              />
                            </div>
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </Marquee>
                </div>
              </div>

            </div>

            {/* Right Column - Sidebar (1/3) */}
            <div className="space-y-6">

              {/* Your Stats Card */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="nm-raised p-7 top-8"
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  Your Stats
                  <span className="text-xl">📈</span>
                </h3>

                {!currentUser ? (
                  <div className="text-center py-6">
                    <div className="text-5xl mb-4">🔐</div>
                    <h4 className="text-lg font-bold text-gray-800 mb-2">Track Your Progress</h4>
                    <p className="text-sm text-gray-500 mb-5">Sign in to see your streaks, coins, and achievements</p>
                    <Link href="/sign-in">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 rounded-xl nm-gradient-btn cursor-pointer"
                      >
                        Sign In →
                      </motion.button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {stats.map((stat, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.03 }}
                        className="cursor-pointer"
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">{stat.emoji}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-base font-semibold text-gray-600">
                                {stat.label}
                              </span>
                              <span
                                className={`text-2xl font-black ${stat.highlight
                                  ? "bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent"
                                  : "text-gray-800"
                                  }`}
                              >
                                {stat.value}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">{stat.subtext}</span>
                          </div>
                        </div>
                        {i < stats.length - 1 && (
                          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mt-6" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Daily Quests Widget */}
              {currentUser && (
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="nm-raised p-7"
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      Daily Quests
                      <span className="text-purple-500"><Target size={20} /></span>
                    </h3>
                    <Link href="/quests">
                      <button className="text-xs font-bold text-purple-600 hover:text-purple-800 px-2 py-1 rounded-lg nm-btn transition-colors">
                        View All
                      </button>
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {todayQuests === undefined ? (
                      <div className="text-center text-gray-500 py-4 text-sm">Loading quests...</div>
                    ) : todayQuests.length === 0 ? (
                      <div className="text-center text-gray-500 py-4 text-sm">No quests today!</div>
                    ) : (
                      todayQuests.slice(0, 3).map((quest, i) => {
                        const percent = Math.min((quest.progress / quest.target) * 100, 100);
                        const isClaimed = quest.claimedReward;

                        return (
                          <div key={quest._id} className={`flex items-center gap-3 p-3 rounded-xl ${isClaimed ? "nm-inset-xs opacity-60" : "nm-flat"}`}>
                            <div className="text-2xl shrink-0">{quest.emoji}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-800 truncate">{quest.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-2 nm-progress-track overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${isClaimed ? "bg-green-500" : "bg-gradient-to-r from-purple-500 to-blue-500"}`}
                                    style={{ width: `${percent}%` }}
                                  ></div>
                                </div>
                                <span className="text-[10px] font-bold text-gray-500 w-8 text-right">
                                  {quest.progress}/{quest.target}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}

            </div>

          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}