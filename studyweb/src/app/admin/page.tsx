"use client";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Sidebar from "../../../components/Sidebar";
import { motion } from "framer-motion";
import {
  Users, BookOpen, MessageCircle, AlertTriangle,
  Coins, ShieldBan, ShoppingBag, Trophy,
  Target, TrendingUp, Clock, Shield,
  ChevronRight, Loader2
} from "lucide-react";
import Link from "next/link";

const statCards = [
  { key: "totalUsers", label: "Total Users", icon: Users, gradient: "from-blue-500 to-cyan-500", emoji: "👥" },
  { key: "totalPosts", label: "Total Posts", icon: BookOpen, gradient: "from-purple-500 to-pink-500", emoji: "📝" },
  { key: "totalAnswers", label: "Total Answers", icon: MessageCircle, gradient: "from-green-500 to-emerald-500", emoji: "💬" },
  { key: "pendingReports", label: "Pending Reports", icon: AlertTriangle, gradient: "from-red-500 to-orange-500", emoji: "⚠️" },
  { key: "totalCoins", label: "Coins in Circulation", icon: Coins, gradient: "from-yellow-500 to-amber-500", emoji: "💰" },
  { key: "bannedUsers", label: "Banned Users", icon: ShieldBan, gradient: "from-gray-500 to-gray-700", emoji: "🚫" },
  { key: "storeItems", label: "Store Items", icon: ShoppingBag, gradient: "from-indigo-500 to-blue-500", emoji: "🛍️" },
  { key: "achievements", label: "Achievements", icon: Trophy, gradient: "from-amber-500 to-orange-600", emoji: "🏆" },
  { key: "activeQuests", label: "Active Quests", icon: Target, gradient: "from-teal-500 to-cyan-500", emoji: "🎯" },
];

const quickLinks = [
  { label: "Users", href: "/admin/users", icon: Users, gradient: "from-blue-500 to-cyan-500", desc: "Manage all users" },
  { label: "Reports", href: "/admin/reports", icon: AlertTriangle, gradient: "from-red-500 to-orange-500", desc: "Review reports" },
  { label: "Store", href: "/admin/store", icon: ShoppingBag, gradient: "from-purple-500 to-pink-500", desc: "Manage store items" },
  { label: "Achievements", href: "/admin/achievements", icon: Trophy, gradient: "from-amber-500 to-orange-600", desc: "Manage achievements" },
  { label: "Quests", href: "/admin/quests", icon: Target, gradient: "from-green-500 to-emerald-500", desc: "Daily quests" },
  { label: "Categories", href: "/admin/categories", icon: BookOpen, gradient: "from-indigo-500 to-blue-500", desc: "Post categories" },
];

const activityIcons: Record<string, string> = {
  posted: "📝",
  answered: "💬",
  best_answer: "⭐",
  earned_coins: "💰",
  purchased: "🛍️",
};

export default function AdminDashboardPage() {
  const stats = useQuery(api.admin.getDashboardStats);

  if (stats === undefined) {
    return (
      <>
        <Sidebar />
        <div className="min-h-screen bg-[var(--nm-bg)] flex items-center justify-center lg:pl-[280px]">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Loading Dashboard...</h2>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="min-h-screen bg-[var(--nm-bg)] pt-20 lg:pt-10 px-5 pb-10 lg:pl-[300px]">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #8b5cf6, #6366f1, #3b82f6)",
                  boxShadow: "4px 4px 8px var(--nm-shadow-dark), -4px -4px 8px var(--nm-shadow-light)",
                }}
              >
                <Shield size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-800">Admin Dashboard</h1>
                <p className="text-gray-500 text-sm">Overview of your platform</p>
              </div>
            </div>
          </motion.div>

          {/* Weekly Highlights */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
          >
            <div className="nm-raised p-5 flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                  boxShadow: "3px 3px 6px var(--nm-shadow-dark), -3px -3px 6px var(--nm-shadow-light)",
                }}
              >
                <TrendingUp size={22} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">New Users This Week</p>
                <p className="text-2xl font-black text-gray-800">{stats.newUsersThisWeek}</p>
              </div>
            </div>
            <div className="nm-raised p-5 flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
                  boxShadow: "3px 3px 6px var(--nm-shadow-dark), -3px -3px 6px var(--nm-shadow-light)",
                }}
              >
                <BookOpen size={22} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Posts This Week</p>
                <p className="text-2xl font-black text-gray-800">{stats.postsThisWeek}</p>
              </div>
            </div>
          </motion.div>

          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {statCards.map((card, i) => {
              const Icon = card.icon;
              const value = (stats as any)[card.key] ?? 0;
              return (
                <motion.div
                  key={card.key}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.04 }}
                  className="nm-raised p-5 flex items-center gap-4"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-r ${card.gradient} flex items-center justify-center shrink-0 shadow-md`}
                  >
                    <Icon size={22} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-bold uppercase truncate">{card.label}</p>
                    <p className="text-2xl font-black text-gray-800">
                      {typeof value === "number" ? value.toLocaleString() : value}
                    </p>
                  </div>
                  <span className="text-2xl">{card.emoji}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Links & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Quick Links */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="nm-raised p-6"
            >
              <h2 className="text-xl font-black text-gray-800 mb-5 flex items-center gap-2">
                ⚡ Quick Access
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link key={link.href} href={link.href}>
                      <div className="flex items-center gap-3 p-3.5 rounded-xl transition-all hover:-translate-y-0.5 cursor-pointer nm-flat group">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${link.gradient} flex items-center justify-center shrink-0 shadow-sm`}>
                          <Icon size={18} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 group-hover:text-purple-600 transition-colors">{link.label}</p>
                          <p className="text-xs text-gray-500 truncate">{link.desc}</p>
                        </div>
                        <ChevronRight size={16} className="text-gray-300 group-hover:text-purple-500 transition-colors shrink-0" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="nm-raised p-6"
            >
              <h2 className="text-xl font-black text-gray-800 mb-5 flex items-center gap-2">
                <Clock size={20} className="text-purple-500" /> Recent Activity
              </h2>
              {stats.recentActivities.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-sm text-gray-500">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {stats.recentActivities.map((activity: any, i: number) => (
                    <motion.div
                      key={activity._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.04 }}
                      className="flex items-center gap-3 p-3 rounded-xl nm-flat"
                    >
                      {/* Avatar */}
                      <div
                        className="w-9 h-9 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
                        style={{
                          background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                          boxShadow: "2px 2px 4px var(--nm-shadow-dark), -2px -2px 4px var(--nm-shadow-light)",
                        }}
                      >
                        {activity.userPic ? (
                          <img src={activity.userPic} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white font-bold text-xs">
                            {activity.userName?.[0]?.toUpperCase() || "?"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate">
                          <span className="font-bold text-gray-800">{activity.userName}</span>{" "}
                          <span className="text-gray-500">{activity.message}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(activity.createdAt).toLocaleDateString("th-TH", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <span className="text-xl shrink-0">
                        {activityIcons[activity.type] || "📌"}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
