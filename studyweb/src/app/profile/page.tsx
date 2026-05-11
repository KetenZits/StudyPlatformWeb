"use client";
import { motion } from "framer-motion";
import { Edit, Mail, Calendar, Award, Flame, TrendingUp, Coins, Shield, Ban, Loader2, User2, Trophy, Zap, Backpack, type LucideIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Sidebar from "../../../components/Sidebar";
import Footer from "../../../components/Footer";
import Link from "next/link";

export default function ProfilePage() {
  const { user } = useUser();
  const userId = user?.id;
  const currentUser = useQuery(api.users.getCurrentUser);
  const createUser = useMutation(api.users.createUser);
  const [created, setCreated] = useState(false);
  const overview = useQuery(api.users.getUserOverview, userId ? { userId } : "skip");
  const userAchievements = useQuery(api.achievements.getUserAchievements, currentUser ? { userId: currentUser._id } : "skip");
  const recentActivities = useQuery(api.activities.getRecentActivities, currentUser ? { userId: currentUser._id, limit: 5 } : "skip");
  const myItems = useQuery(api.store.getUserItems, currentUser ? { userId: currentUser._id } : "skip");
  const toggleEquip = useMutation(api.store.toggleEquip);

  const handleEquip = async (userItemId: Id<"userItems">) => { try { await toggleEquip({ userItemId }); } catch (err) { console.error("Failed to equip item", err); } };

  useEffect(() => {
    if (user && currentUser === null && !created) {
      createUser({ clerkId: user.id, email: user.primaryEmailAddress?.emailAddress || "unknown", name: user.firstName || "NoName", profilePic: user.imageUrl, coins: 0, answerStreak: 0, bestStreak: 0, role: "user", banned: false, createdAt: Date.now() }).then(() => setCreated(true));
    }
  }, [user, currentUser, createUser, created]);

  const formatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { gradient: string; icon: LucideIcon }> = {
      admin: { gradient: "from-red-500 to-pink-600", icon: Shield }, Admin: { gradient: "from-red-500 to-pink-600", icon: Shield },
      moderator: { gradient: "from-purple-500 to-indigo-600", icon: Award }, user: { gradient: "from-blue-500 to-cyan-500", icon: User2 },
    };
    return badges[role as keyof typeof badges] || badges.user;
  };

  const getRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp; const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now"; if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60); if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24); if (days < 7) return `${days}d ago`; return formatDate(timestamp);
  };

  const getActivityColor = (type: string) => ({ posted: "from-purple-500 to-pink-500", answered: "from-blue-500 to-cyan-500", best_answer: "from-yellow-500 to-orange-500", earned_coins: "from-amber-500 to-orange-600" }[type] || "from-gray-500 to-gray-600");
  const getActivityIcon = (type: string) => ({ posted: "❓", answered: "✅", best_answer: "⭐", earned_coins: "💰" }[type] || "📝");

  if (!user) return (<div className="min-h-screen bg-[#e0e5ec] flex items-center justify-center"><div className="text-center"><div className="text-6xl mb-4">🔒</div><h2 className="text-2xl font-bold text-gray-800 mb-2">Please Login</h2><p className="text-gray-500">You need to be logged in to view your profile</p></div></div>);
  if (currentUser === undefined) return (<div className="min-h-screen bg-[#e0e5ec] flex items-center justify-center"><div className="text-center"><Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" /><h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Profile...</h2></div></div>);
  if (currentUser === null) return (<div className="min-h-screen bg-[#e0e5ec] flex items-center justify-center"><div className="text-center"><Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" /><h2 className="text-2xl font-bold text-gray-800 mb-2">Creating Profile...</h2></div></div>);

  const roleBadge = getRoleBadge(currentUser.role);
  const RoleIcon = roleBadge.icon;

  return (<><Sidebar /><div className="min-h-screen bg-[#e0e5ec] lg:pl-[280px]">
    <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-20 md:pt-12 pb-16">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-10">
        <div className="flex items-center gap-3 mb-3"><span className="text-5xl">👤</span><h1 className="text-4xl sm:text-5xl font-black text-gray-800 tracking-tight">Profile <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">Overview</span></h1></div>
        <p className="text-gray-500 text-lg font-medium">Manage your account and track your learning journey ✨</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Profile Card */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="lg:col-span-2 nm-raised overflow-hidden">
          <div className="h-40 relative" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1, #3b82f6)' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12"></div>
          </div>
          <div className="px-6 sm:px-8 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-16 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                <div className="relative w-fit">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center ring-4 ring-[#e0e5ec] overflow-hidden" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', boxShadow: '8px 8px 16px #a3b1c6, -8px -8px 16px #ffffff' }}>
                    {currentUser.profilePic ? <img src={currentUser.profilePic} alt={currentUser.name} className="w-full h-full object-cover" /> : <span className="text-white font-black text-4xl">{getInitials(currentUser.name)}</span>}
                  </div>
                  {currentUser.banned && <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-xl ring-4 ring-[#e0e5ec]"><Ban size={18} className="text-white" /></div>}
                </div>
                <div className="pb-2 mt-4 sm:mt-0 flex items-center gap-7 justify-center">
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-800 mb-2 break-words">{currentUser.name}</h2>
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r ${roleBadge.gradient} shadow-md mb-3 relative top-[4px]`}><RoleIcon size={16} className="text-white" /><span className="text-sm font-bold text-white uppercase">{currentUser.role}</span></div>
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-xl nm-gradient-btn w-full sm:w-auto">
                <Link href={'/profile/edit'} className="flex justify-center items-center gap-4"><Edit size={18} /><span>Edit</span></Link>
              </motion.button>
            </div>
            <div className="grid grid-cols-1 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 rounded-2xl nm-flat">
                <div className="w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}><Mail size={20} className="text-white" /></div>
                <div className="min-w-0 flex-1"><div className="text-xs font-semibold text-gray-500 mb-1">Email</div><div className="text-sm font-bold text-gray-800 truncate">{currentUser.email}</div></div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl nm-flat">
                <div className="w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}><Calendar size={20} className="text-white" /></div>
                <div className="min-w-0 flex-1"><div className="text-xs font-semibold text-gray-500 mb-1">Member Since</div><div className="text-sm font-bold text-gray-800">{formatDate(currentUser.createdAt)}</div></div>
              </div>
            </div>
            {currentUser.bio && <div className="p-5 rounded-2xl nm-inset"><h3 className="text-sm font-bold text-gray-600 mb-2">About Me</h3><p className="text-gray-700 leading-relaxed">{currentUser.bio}</p></div>}
          </div>
        </motion.div>

        {/* Right - Stats */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-4">
            {[
              { icon: Coins, label: "Total Coins", value: currentUser.coins, grad: "from-amber-500 to-orange-600", suffix: "" },
              { icon: Flame, label: "Current Streak", value: `${currentUser.displayStreak}`, grad: currentUser.isStreakActive ? "from-red-500 to-orange-500" : "from-gray-400 to-gray-500", suffix: " days", extra: !currentUser.isStreakActive && currentUser.answerStreak > 0 ? `Streak broken! (was ${currentUser.answerStreak})` : null },
              { icon: TrendingUp, label: "Best Streak", value: currentUser.bestStreak, grad: "from-purple-500 to-pink-500", suffix: " days" },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="nm-raised p-6 hover:scale-[1.02] transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.grad} flex items-center justify-center`} style={{ boxShadow: '4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff' }}><Icon size={28} className="text-white" /></div>
                    <div className="flex-1"><div className="text-sm font-semibold text-gray-500 mb-1">{stat.label}</div><div className="text-3xl font-black text-gray-800">{stat.value}<span className="text-lg font-semibold text-gray-500">{stat.suffix}</span></div>
                      {stat.extra && <p className="text-xs text-red-500 font-semibold mt-1">{stat.extra}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Achievements */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="nm-raised p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Achievements</h3>
              {currentUser && <Link href={`/profile/achievements?userId=${currentUser._id}`} className="text-sm font-bold text-purple-600 hover:text-purple-800 transition-colors">View All →</Link>}
            </div>
            {userAchievements === undefined ? <p className="text-sm text-gray-400">Loading...</p>
            : userAchievements.length === 0 ? <div className="text-center py-6"><Trophy className="mx-auto text-gray-300 mb-2" size={32} /><p className="text-sm text-gray-400">No achievements yet</p></div>
            : <div className="grid grid-cols-2 gap-3">{userAchievements.slice(0, 4).map((ua) => (
              <motion.div key={ua._id} whileHover={{ scale: 1.05, y: -2 }} className="aspect-square rounded-2xl nm-flat hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-center gap-2 p-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', boxShadow: '3px 3px 6px #a3b1c6, -3px -3px 6px #ffffff' }}>
                  {ua.achievement?.imageUrl ? <img src={ua.achievement.imageUrl} alt="" className="w-full h-full object-cover" /> : <Trophy size={22} className="text-white" />}
                </div>
                <span className="text-xs font-bold text-gray-700 text-center leading-tight">{ua.achievement?.name}</span>
              </motion.div>
            ))}</div>}
          </motion.div>
        </div>
      </div>

      {/* Inventory */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }} className="mt-6 nm-raised p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div><h3 className="text-2xl font-black text-gray-800 flex items-center gap-3"><Backpack className="text-purple-500" size={28} />My Inventory</h3><p className="text-gray-500 text-sm mt-1">Equip items to customize your profile.</p></div>
          <Link href="/store" className="nm-gradient-btn px-5 py-2 text-sm flex items-center gap-2"><Coins size={16} className="text-yellow-300" />Go to Store</Link>
        </div>
        {myItems === undefined ? <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-purple-500" /></div>
        : myItems.length === 0 ? <div className="text-center py-12 nm-inset"><p className="text-gray-400 font-semibold mb-2">Your inventory is empty.</p><Link href="/store" className="text-purple-600 font-bold hover:underline">Buy your first item!</Link></div>
        : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{myItems.map((item) => (
          <div key={item._id} className={`p-4 rounded-2xl transition-all relative ${item.equipped ? "nm-inset ring-2 ring-purple-400" : "nm-flat"}`}>
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-black uppercase text-gray-400 nm-inset-xs px-2 py-0.5 tracking-wider">{item.details?.type}</span>
              {item.equipped && <span className="flex items-center gap-1 text-white text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}><Zap size={10} fill="currentColor" /> EQUIPPED</span>}
            </div>
            <div className="mb-4"><h4 className="font-bold text-gray-800 line-clamp-1">{item.details?.name}</h4><p className="text-xs text-gray-500 line-clamp-2 mt-1 min-h-[2.5em]">{item.details?.description}</p></div>
            <button onClick={() => handleEquip(item._id)} className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${item.equipped ? "nm-btn text-purple-600" : "nm-gradient-btn active:scale-95"}`}>{item.equipped ? "Unequip" : "Equip"}</button>
          </div>
        ))}</div>}
      </motion.div>

      {/* Activity & Overview */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="nm-raised p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2"><Zap className="text-purple-500" size={24} />Recent Activity</h3>
          {recentActivities === undefined ? <div className="text-center py-8"><Loader2 className="animate-spin mx-auto text-purple-500" size={24} /></div>
          : recentActivities.length === 0 ? <div className="text-center py-8"><p className="text-gray-400">No recent activity yet.</p></div>
          : <div className="space-y-3">{recentActivities.map((activity) => (
            <div key={activity._id} className="flex items-center gap-3 p-3 rounded-xl nm-flat transition-all">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getActivityColor(activity.type)} flex items-center justify-center shadow-md flex-shrink-0`}><span className="text-lg">{getActivityIcon(activity.type)}</span></div>
              <div className="flex-1 min-w-0"><div className="text-sm font-bold text-gray-800 truncate">{activity.message}</div><div className="text-xs text-gray-500">{getRelativeTime(activity.createdAt)}</div></div>
            </div>
          ))}</div>}
        </div>

        <div className="nm-raised p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2"><TrendingUp className="text-purple-500" size={24} />Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Questions Asked", value: overview?.questionsCount, icon: "❓" },
              { label: "Answers Given", value: overview?.answersCount, icon: "✅" },
              { label: "Best Answers", value: overview?.bestCount, icon: "⭐" },
              { label: "Helpful Votes", value: overview?.helpfulVotes, icon: "👍" },
            ].map((stat, i) => (
              <motion.div key={i} whileHover={{ scale: 1.05 }} className="p-4 rounded-xl nm-flat transition-all">
                <div className="text-2xl mb-2">{stat.icon}</div><div className="text-2xl font-black text-gray-800 mb-1">{stat.value}</div><div className="text-xs font-semibold text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  </div><Footer /></>);
}