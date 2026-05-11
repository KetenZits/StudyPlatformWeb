"use client";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import Sidebar from "../../../../components/Sidebar";
import Footer from "../../../../components/Footer";
import { Trophy, ArrowLeft, Loader2, Calendar, Award } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

function AchievementsContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") as Id<"users"> | null;
  const userAchievements = useQuery(api.achievements.getUserAchievements, userId ? { userId } : "skip");
  const profile = useQuery(api.users.getUserPublicProfile, userId ? { userId } : "skip");

  if (!userId) return (<><Sidebar /><div className="min-h-screen bg-[#e0e5ec] flex items-center justify-center lg:pl-[280px]"><div className="text-center"><div className="text-6xl mb-4">⚠️</div><h2 className="text-2xl font-bold text-gray-800 mb-2">Missing User ID</h2><p className="text-gray-500">No user specified.</p></div></div></>);

  return (<><Sidebar /><div className="min-h-screen bg-[#e0e5ec] pt-20 lg:pt-12 px-5 pb-16 lg:pl-[280px]">
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
        <Link href={`/profile/${userId}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl nm-btn text-gray-600 font-semibold transition-all"><ArrowLeft size={20} />Back to Profile</Link>
      </motion.div>

      <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          {profile?.profilePic ? <img src={profile.profilePic} alt="" className="w-14 h-14 rounded-2xl object-cover" style={{ boxShadow: '4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff' }} />
          : <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', boxShadow: '4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff' }}><Trophy size={24} className="text-white" /></div>}
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-800">{profile?.name ? `${profile.name}'s` : ""} <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">Achievements</span></h1>
            <p className="text-gray-500 mt-1">{userAchievements ? `${userAchievements.length} achievement${userAchievements.length !== 1 ? "s" : ""} earned` : "Loading..."}</p>
          </div>
        </div>
      </motion.div>

      {userAchievements === undefined ? (
        <div className="text-center py-20"><Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" /><p className="text-gray-400">Loading achievements...</p></div>
      ) : userAchievements.length === 0 ? (
        <div className="text-center py-20"><Trophy className="mx-auto text-gray-300 mb-4" size={64} /><p className="text-gray-400 text-lg">No achievements yet</p><p className="text-gray-400 text-sm mt-1">Keep learning to earn achievements!</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {userAchievements.map((ua, i) => (
            <motion.div key={ua._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }} className="nm-raised p-6 transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', boxShadow: '4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff' }}>
                  {ua.achievement?.imageUrl ? <img src={ua.achievement.imageUrl} alt={ua.achievement?.name} className="w-full h-full object-cover" /> : <Trophy className="text-white" size={28} />}
                </div>
                <div className="flex-1 min-w-0"><h3 className="text-lg font-bold text-gray-800 truncate">{ua.achievement?.name ?? "Unknown"}</h3><p className="text-sm text-gray-500 mt-1 line-clamp-2">{ua.achievement?.description}</p></div>
              </div>
              <div className="space-y-2">
                {ua.achievement?.condition && <div className="flex items-center gap-2"><Award size={14} className="text-purple-600 shrink-0" /><span className="text-xs font-semibold text-purple-700 nm-inset-xs px-3 py-1 truncate">{ua.achievement.condition}</span></div>}
                <div className="flex items-center gap-2"><Calendar size={14} className="text-gray-400 shrink-0" /><span className="text-xs text-gray-400">Awarded: {new Date(ua.awardedAt).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</span></div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  </div><Footer /></>);
}

export default function AchievementsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#e0e5ec] flex items-center justify-center"><Loader2 className="w-12 h-12 text-purple-600 animate-spin" /></div>}>
      <AchievementsContent />
    </Suspense>
  );
}
