"use client";
import { MessageCircle, ChevronRight, ArrowRight, Sparkles, TrendingUp, Award, Clock, Store } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { api } from "../../convex/_generated/api";
import { useQuery } from "convex/react";
import Link from "next/link";

export default function Index() {

  const currentUser = useQuery(api.users.getCurrentUser);
  const postsrecent = useQuery(api.posts.getPostsRecent)

  const paths = [
    { icon: TrendingUp, emoji: "🔥", title: "Hot Questions", subtitle: "Trending now", color: "from-orange-500 to-red-500" },
    { icon: Clock, emoji: "🕒", title: "Recent", subtitle: "Latest posts", color: "from-blue-500 to-cyan-500" },
    { icon: Award, emoji: "🏆", title: "Leaderboard", subtitle: "Top contributors", color: "from-purple-500 to-pink-500" },
    { icon: Store, emoji: "🛒", title: "Store", subtitle: "Redeem rewards", color: "from-green-500 to-emerald-500" },
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
    <Navbar/>
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 mt-20">
      
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
                  <span className="font-bold bg-gradient-to-r from-[#D4A574] to-[#B8873D] bg-clip-text text-transparent text-xl">
                    {currentUser?.name ?? "There"}
                  </span>
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-6xl font-black text-gray-900 mb-3 tracking-tight">
                Welcome To <span className="bg-gradient-to-r from-[#D4A574] via-[#C9984E] to-[#B8873D] bg-clip-text text-transparent">NeuroSync</span>
              </h1>
              
              <p className="text-gray-600 text-lg font-medium">
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
              className="p-10 rounded-3xl bg-gradient-to-br from-[#D4A574] via-[#C9984E] to-[#B8873D] shadow-2xl shadow-amber-300/30 relative overflow-hidden cursor-pointer"
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
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white hover:bg-gray-50 shadow-xl transition-all group cursor-pointer"
                >
                  <span className="text-lg font-bold text-[#C9984E]">
                    Ask Now
                  </span>
                  <ArrowRight size={22} className="text-[#C9984E] group-hover:translate-x-2 transition-transform" />
                </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Quick Access Grid */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Access</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {paths.map((path, i) => (
                  <motion.button
                    key={i}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative flex items-center gap-5 rounded-2xl bg-white/90 backdrop-blur-sm p-6 shadow-lg hover:shadow-2xl transition-all border border-white/50 group overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${path.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                    
                    <div className="text-5xl transform group-hover:scale-110 transition-transform">
                      {path.emoji}
                    </div>
                    
                    <div className="flex flex-col items-start flex-1">
                      <span className="text-lg font-bold text-gray-900 mb-1">
                        {path.title}
                      </span>
                      <span className="text-sm text-gray-500 font-medium">
                        {path.subtitle}
                      </span>
                    </div>
                    
                    <ChevronRight className="text-gray-400 group-hover:text-[#C9984E] group-hover:translate-x-1 transition-all" size={24} />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Recent Questions */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Recent Questions</h2>
                <Link href={'/posts'}>
                  <button className="text-base font-bold text-[#C9984E] hover:text-[#B8873D] transition-colors px-4 py-2 rounded-xl hover:bg-amber-50/50 cursor-pointer">
                    View All →
                  </button>
                </Link>
              </div>

              <div className="space-y-4">
                {postsrecent?.slice(0, 5).map((post, i) => (
                  <motion.div
                    key={post._id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                    whileHover={{ y: -3 }}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-white/50 cursor-pointer group"
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
                              className="w-10 h-10 rounded-full object-cover border border-amber-200 shadow-sm"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4A574] via-[#C9984E] to-[#B8873D] flex items-center justify-center text-white font-bold text-sm">
                              {post.username?.[0]?.toUpperCase() ?? "U"}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{post.username ?? "Anonymous"}</p>
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
                          <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                            <span className="text-xs font-bold text-amber-900">
                              {post.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Image (optional) */}
                    {post.imageUrl && (
                      <div className="mb-4">
                        <img
                          src={post.imageUrl}
                          alt="Post image"
                          className="w-full h-48 object-cover rounded-xl border border-gray-100 shadow-sm"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2 group-hover:text-[#C9984E] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-base text-gray-600 leading-relaxed line-clamp-3">
                      {post.body}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                      <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl">
                        <MessageCircle size={18} className="text-[#C9984E]" />
                        <span className="text-sm font-bold text-[#C9984E]">
                          {post.answersCount ?? 0} answers
                        </span>
                      </div>

                      <Link href={`/posts/${post._id}`}>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center group-hover:from-[#C9984E] group-hover:to-[#B8873D] transition-all">
                        <ChevronRight
                          size={20}
                          className="text-[#C9984E] group-hover:text-white transition-colors"
                        />
                      </div>
                      </Link>
                    </div>
                  </motion.div>
                ))}
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
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-7 shadow-lg border border-white/50 top-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                Your Stats
                <span className="text-xl">📈</span>
              </h3>

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
                          <span className="text-base font-semibold text-gray-700">
                            {stat.label}
                          </span>
                          <span
                            className={`text-2xl font-black ${
                              stat.highlight 
                                ? "bg-gradient-to-r from-[#D4A574] to-[#B8873D] bg-clip-text text-transparent" 
                                : "text-gray-900"
                            }`}
                          >
                            {stat.value}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">{stat.subtext}</span>
                      </div>
                    </div>
                    {i < stats.length - 1 && (
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mt-6" />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

          </div>

        </div>

      </div>
    </div>
    <Footer/>
    </>
  );
}