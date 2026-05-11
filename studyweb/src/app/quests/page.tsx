"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, Coins, CheckCircle, Clock } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";
import Sidebar from "../../../components/Sidebar";
import Footer from "../../../components/Footer";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useToast } from "../../../components/Toast";

export default function QuestsPage() {
  const { isSignedIn } = useUser();
  const toast = useToast();
  const quests = useQuery(api.dailyQuests.getTodayQuests);
  const claimReward = useMutation(api.dailyQuests.claimReward);
  const [timeLeftStr, setTimeLeftStr] = useState("");

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeftStr(`${h}h ${m}m`);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleClaim = async (questId: Id<"dailyQuests">) => {
    try {
      const res = await claimReward({ questId });
      toast.success("Reward Claimed! 🎉", `You earned ${res.reward} coins!`);
    } catch (error) { toast.error("Error", (error as Error).message); }
  };

  return (<><Sidebar /><div className="min-h-screen bg-[#e0e5ec] pt-20 lg:pt-10 pb-16 lg:pl-[280px]">
    <div className="max-w-4xl mx-auto px-5 md:px-8">
      <div className="text-center mb-12 relative">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
          className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center rotate-3 mb-6"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', boxShadow: '8px 8px 16px #a3b1c6, -8px -8px 16px #ffffff' }}>
          <Target size={48} className="text-white" />
        </motion.div>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-800 mb-4 tracking-tight">Daily <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">Quests</span></h1>
        <p className="text-lg text-gray-500 font-medium max-w-lg mx-auto">Complete tasks every day to earn coins and unlock special rewards!</p>
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full nm-raised">
          <Clock size={16} className="text-gray-400" /><span className="text-sm font-bold text-gray-600">Resets in <span className="text-purple-600">{timeLeftStr}</span></span>
        </div>
      </div>

      {!isSignedIn ? (
        <div className="nm-raised p-10 text-center"><div className="text-6xl mb-4">🔐</div><h2 className="text-2xl font-bold text-gray-800 mb-2">Sign in to play</h2><p className="text-gray-500">Track your progress and earn rewards</p></div>
      ) : quests === undefined ? (
        <div className="text-center py-20 text-gray-500">Loading quests...</div>
      ) : quests.length === 0 ? (
        <div className="nm-raised p-10 text-center"><div className="text-6xl mb-4">🏝️</div><h2 className="text-2xl font-bold text-gray-800 mb-2">No quests available today</h2><p className="text-gray-500">Check back later!</p></div>
      ) : (
        <div className="space-y-4">
          {quests.map((quest, i) => {
            const percent = Math.min((quest.progress / quest.target) * 100, 100);
            const isReadyToClaim = quest.completed && !quest.claimedReward;
            const isClaimed = quest.claimedReward;
            return (
              <motion.div key={quest._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className={`relative overflow-hidden p-6 transition-all ${isClaimed ? "nm-inset opacity-70" : isReadyToClaim ? "nm-raised ring-2 ring-green-400" : "nm-raised"}`}>
                {isClaimed && (
                  <div className="absolute inset-0 bg-[#e0e5ec]/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <div className="nm-raised px-6 py-3 flex items-center gap-2 transform rotate-12"><CheckCircle className="text-green-500" /><span className="font-bold text-gray-800">Completed!</span></div>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${isReadyToClaim ? "nm-raised" : "nm-inset"}`}>{quest.emoji}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{quest.title}</h3>
                    <p className="text-sm text-gray-500 mb-4">{quest.description}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-3 nm-progress-track overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }}
                          className={`h-full rounded-full ${isReadyToClaim || isClaimed ? "bg-green-500" : "bg-gradient-to-r from-purple-500 to-blue-500"}`} />
                      </div>
                      <span className="text-sm font-bold text-gray-600 min-w-[50px] text-right">{quest.progress} / {quest.target}</span>
                    </div>
                  </div>
                  <div className="shrink-0 w-full sm:w-auto mt-4 sm:mt-0 flex flex-col items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg nm-inset-xs"><Coins size={16} className="text-yellow-600" /><span className="font-bold text-yellow-700">+{quest.reward}</span></div>
                    <button disabled={!isReadyToClaim} onClick={() => handleClaim(quest._id)}
                      className={`w-full px-6 py-2.5 rounded-xl font-bold transition-all ${isReadyToClaim ? "nm-gradient-btn bg-gradient-to-r from-green-500 to-emerald-500 hover:-translate-y-0.5" : isClaimed ? "nm-inset-xs text-gray-400 cursor-not-allowed" : "nm-btn text-gray-400 cursor-not-allowed"}`}
                      style={isReadyToClaim ? { background: 'linear-gradient(135deg, #22c55e, #10b981)' } : {}}>
                      {isClaimed ? "Claimed" : "Claim"}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  </div><Footer /></>);
}
