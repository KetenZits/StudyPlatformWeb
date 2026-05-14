"use client";
import { motion } from "framer-motion";
import { Mail, Calendar, Award, Flame, TrendingUp, Coins, Shield, Ban, Loader2, User2, Trophy, Zap, ArrowLeft, ShieldAlert, ShieldCheck } from "lucide-react";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import Sidebar from "../../../../components/Sidebar";
import Footer from "../../../../components/Footer";
import Link from "next/link";
import { useToast } from "../../../../components/Toast";

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.userId as Id<"users">;
  const profile = useQuery(api.users.getUserPublicProfile, { userId });
  const currentUser = useQuery(api.users.getCurrentUser);
  const userAchievements = useQuery(api.achievements.getUserAchievements, { userId });
  const recentActivities = useQuery(api.activities.getRecentActivities, { userId, limit: 5 });
  const banUser = useMutation(api.users.banUser);
  const unbanUser = useMutation(api.users.unbanUser);
  const [banLoading, setBanLoading] = useState(false);
  const toast = useToast();

  const handleBan = async () => { setBanLoading(true); try { await banUser({ userId }); } catch (err) { toast.error("Ban Failed", (err as Error).message); } finally { setBanLoading(false); } };
  const handleUnban = async () => { setBanLoading(true); try { await unbanUser({ userId }); } catch (err) { toast.error("Unban Failed", (err as Error).message); } finally { setBanLoading(false); } };
  const formatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const getRoleBadge = (role: string) => ({ Admin: { gradient: "from-red-500 to-pink-600", icon: Shield }, moderator: { gradient: "from-purple-500 to-indigo-600", icon: Award }, user: { gradient: "from-blue-500 to-cyan-500", icon: User2 } }[role] || { gradient: "from-blue-500 to-cyan-500", icon: User2 });
  const getRelativeTime = (timestamp: number) => { const diff = Date.now() - timestamp; const m = Math.floor(diff / 60000); if (m < 1) return "just now"; if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; const d = Math.floor(h / 24); if (d < 7) return `${d}d ago`; return formatDate(timestamp); };
  const getActivityColor = (type: string) => ({ posted: "from-purple-500 to-pink-500", answered: "from-blue-500 to-cyan-500", best_answer: "from-yellow-500 to-orange-500", earned_coins: "from-amber-500 to-orange-600" }[type] || "from-gray-500 to-gray-600");
  const getActivityIcon = (type: string) => ({ posted: "❓", answered: "✅", best_answer: "⭐", earned_coins: "💰" }[type] || "📝");

  if (profile === undefined) return (<><Sidebar /><div className="min-h-screen bg-[var(--nm-bg)] flex items-center justify-center"><div className="text-center"><Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" /><h2 className="text-2xl font-bold text-gray-800">Loading Profile...</h2></div></div></>);
  if (profile === null) return (<><Sidebar /><div className="min-h-screen bg-[var(--nm-bg)] flex items-center justify-center"><div className="text-center"><div className="text-6xl mb-4">😕</div><h2 className="text-2xl font-bold text-gray-800 mb-2">User Not Found</h2><p className="text-gray-500 mb-6">This user does not exist.</p><Link href="/" className="px-6 py-3 rounded-xl nm-gradient-btn">Go Home</Link></div></div></>);

  const roleBadge = getRoleBadge(profile.role);
  const RoleIcon = roleBadge.icon;
  const isAdmin = currentUser?.role === "Admin";
  const isOwnProfile = currentUser?._id === profile._id;

  return (<><Sidebar /><div className="min-h-screen bg-[var(--nm-bg)] lg:pl-[280px]">
    <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-20 md:pt-12 pb-16">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl nm-btn text-gray-600 font-semibold"><ArrowLeft size={20} />Back</Link>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="lg:col-span-2 nm-raised overflow-hidden">
          <div className="h-40 relative" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1, #3b82f6)' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12"></div>
            {profile.banned && <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg"><Ban size={16} /> BANNED</div>}
          </div>
          <div className="px-6 sm:px-8 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-16 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                <div className="relative w-fit">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center ring-4 ring-[var(--nm-bg)] overflow-hidden" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', boxShadow: '8px 8px 16px var(--nm-shadow-dark), -8px -8px 16px var(--nm-shadow-light)' }}>
                    {profile.profilePic ? <img src={profile.profilePic} alt={profile.name} className="w-full h-full object-cover" /> : <span className="text-white font-black text-4xl">{getInitials(profile.name)}</span>}
                  </div>
                  {profile.banned && <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-xl ring-4 ring-[var(--nm-bg)]"><Ban size={18} className="text-white" /></div>}
                </div>
                <div className="pb-2 mt-4 sm:mt-0 flex items-center gap-7 justify-center">
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-800 mb-2 break-words">{profile.name}</h2>
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r ${roleBadge.gradient} shadow-md mb-3 relative top-[4px]`}><RoleIcon size={16} className="text-white" /><span className="text-sm font-bold text-white uppercase">{profile.role}</span></div>
                </div>
              </div>
              {isAdmin && !isOwnProfile && (
                <div>{profile.banned ? (
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleUnban} disabled={banLoading} className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition-all disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '4px 4px 8px var(--nm-shadow-dark), -4px -4px 8px var(--nm-shadow-light)' }}><ShieldCheck size={18} />{banLoading ? "Processing..." : "Unban User"}</motion.button>
                ) : (
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleBan} disabled={banLoading} className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition-all disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)', boxShadow: '4px 4px 8px var(--nm-shadow-dark), -4px -4px 8px var(--nm-shadow-light)' }}><ShieldAlert size={18} />{banLoading ? "Processing..." : "Ban User"}</motion.button>
                )}</div>
              )}
              {isOwnProfile && <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="nm-gradient-btn px-6 py-3"><Link href="/profile/edit" className="flex items-center gap-2">Edit Profile</Link></motion.button>}
            </div>
            <div className="grid grid-cols-1 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 rounded-2xl nm-flat"><div className="w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', boxShadow: '3px 3px 6px var(--nm-shadow-dark), -3px -3px 6px var(--nm-shadow-light)' }}><Mail size={20} className="text-white" /></div><div className="min-w-0 flex-1"><div className="text-xs font-semibold text-gray-500 mb-1">Email</div><div className="text-sm font-bold text-gray-800 truncate">{profile.email}</div></div></div>
              <div className="flex items-center gap-3 p-4 rounded-2xl nm-flat"><div className="w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', boxShadow: '3px 3px 6px var(--nm-shadow-dark), -3px -3px 6px var(--nm-shadow-light)' }}><Calendar size={20} className="text-white" /></div><div className="min-w-0 flex-1"><div className="text-xs font-semibold text-gray-500 mb-1">Member Since</div><div className="text-sm font-bold text-gray-800">{formatDate(profile.createdAt)}</div></div></div>
            </div>
            {profile.bio && <div className="p-5 rounded-2xl nm-inset"><h3 className="text-sm font-bold text-gray-600 mb-2">About Me</h3><p className="text-gray-700 leading-relaxed">{profile.bio}</p></div>}
          </div>
        </motion.div>

        <div className="lg:col-span-1 space-y-6">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-4">
            {[
              { icon: Coins, label: "Total Coins", value: profile.coins, grad: "from-amber-500 to-orange-600", suffix: "" },
              { icon: Flame, label: "Current Streak", value: `${profile.displayStreak}`, grad: profile.isStreakActive ? "from-red-500 to-orange-500" : "from-gray-400 to-gray-500", suffix: " days", extra: !profile.isStreakActive && profile.answerStreak > 0 ? `Streak broken! (was ${profile.answerStreak})` : null },
              { icon: TrendingUp, label: "Best Streak", value: profile.bestStreak, grad: "from-purple-500 to-pink-500", suffix: " days" },
            ].map((stat, i) => { const Icon = stat.icon; return (
              <div key={i} className="nm-raised p-6 hover:scale-[1.02] transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.grad} flex items-center justify-center`} style={{ boxShadow: '4px 4px 8px var(--nm-shadow-dark), -4px -4px 8px var(--nm-shadow-light)' }}><Icon size={28} className="text-white" /></div>
                  <div className="flex-1"><div className="text-sm font-semibold text-gray-500 mb-1">{stat.label}</div><div className="text-3xl font-black text-gray-800">{stat.value}<span className="text-lg font-semibold text-gray-500">{stat.suffix}</span></div>
                    {stat.extra && <p className="text-xs text-red-500 font-semibold mt-1">{stat.extra}</p>}
                  </div>
                </div>
              </div>
            ); })}
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="nm-raised p-6">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-gray-800">Achievements</h3><Link href={`/profile/achievements?userId=${userId}`} className="text-sm font-bold text-purple-600 hover:text-purple-800">View All →</Link></div>
            {userAchievements === undefined ? <p className="text-sm text-gray-400">Loading...</p>
            : userAchievements.length === 0 ? <div className="text-center py-6"><Trophy className="mx-auto text-gray-300 mb-2" size={32} /><p className="text-sm text-gray-400">No achievements yet</p></div>
            : <div className="grid grid-cols-2 gap-3">{userAchievements.slice(0, 4).map((ua) => (
              <motion.div key={ua._id} whileHover={{ scale: 1.05, y: -2 }} className="aspect-square rounded-2xl nm-flat transition-all cursor-pointer flex flex-col items-center justify-center gap-2 p-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', boxShadow: '3px 3px 6px var(--nm-shadow-dark), -3px -3px 6px var(--nm-shadow-light)' }}>
                  {ua.achievement?.imageUrl ? <img src={ua.achievement.imageUrl} alt="" className="w-full h-full object-cover" /> : <Trophy size={22} className="text-white" />}
                </div>
                <span className="text-xs font-bold text-gray-700 text-center leading-tight">{ua.achievement?.name}</span>
              </motion.div>
            ))}</div>}
          </motion.div>
        </div>
      </div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="nm-raised p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2"><Zap className="text-purple-500" size={24} />Recent Activity</h3>
          {recentActivities === undefined ? <p className="text-sm text-gray-400">Loading...</p>
          : recentActivities.length === 0 ? <div className="text-center py-8"><p className="text-gray-400">No recent activity</p></div>
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
            {[{ label: "Questions Asked", value: profile.stats.questionsCount, icon: "❓" },{ label: "Answers Given", value: profile.stats.answersCount, icon: "✅" },{ label: "Best Answers", value: profile.stats.bestCount, icon: "⭐" },{ label: "Helpful Votes", value: profile.stats.helpfulVotes, icon: "👍" }].map((stat, i) => (
              <motion.div key={i} whileHover={{ scale: 1.05 }} className="p-4 rounded-xl nm-flat transition-all"><div className="text-2xl mb-2">{stat.icon}</div><div className="text-2xl font-black text-gray-800 mb-1">{stat.value}</div><div className="text-xs font-semibold text-gray-500">{stat.label}</div></motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  </div><Footer /></>);
}
