"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, Coins, CheckCircle, Clock, Trophy } from "lucide-react";
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

  // Countdown to midnight
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

  const handleClaim = async (questId: any) => {
    try {
      const res = await claimReward({ questId });
      toast.success("Reward Claimed! 🎉", `You earned ${res.reward} coins!`);
    } catch (error: any) {
      toast.error("Error", error.message);
    }
  };

  return (
    <>
      <Sidebar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pt-20 lg:pt-10 pb-16 lg:pl-[280px]">
        <div className="max-w-4xl mx-auto px-5 md:px-8">
          
          {/* Header */}
          <div className="text-center mb-12 relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-400 to-amber-500 rounded-3xl flex items-center justify-center shadow-xl rotate-3 mb-6"
            >
              <Target size={48} className="text-white" />
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 tracking-tight">
              Daily <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Quests</span>
            </h1>
            <p className="text-lg text-gray-600 font-medium max-w-lg mx-auto">
              Complete tasks every day to earn coins and unlock special rewards!
            </p>
            
            <div className="mt-6 inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-gray-200 shadow-sm">
              <Clock size={16} className="text-gray-400" />
              <span className="text-sm font-bold text-gray-600">Resets in <span className="text-pink-600">{timeLeftStr}</span></span>
            </div>
          </div>

          {!isSignedIn ? (
            <div className="bg-white rounded-3xl p-10 text-center shadow-xl border border-gray-100">
              <div className="text-6xl mb-4">🔐</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to play</h2>
              <p className="text-gray-500">Track your progress and earn rewards</p>
            </div>
          ) : quests === undefined ? (
            <div className="text-center py-20 text-gray-500">Loading quests...</div>
          ) : quests.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center shadow-xl border border-gray-100">
              <div className="text-6xl mb-4">🏝️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No quests available today</h2>
              <p className="text-gray-500">Check back later for more challenges!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quests.map((quest, i) => {
                const percent = Math.min((quest.progress / quest.target) * 100, 100);
                const isReadyToClaim = quest.completed && !quest.claimedReward;
                const isClaimed = quest.claimedReward;

                return (
                  <motion.div
                    key={quest._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`relative overflow-hidden rounded-3xl p-6 transition-all ${
                      isClaimed 
                        ? "bg-gray-50 border border-gray-200 opacity-70" 
                        : isReadyToClaim
                          ? "bg-white border-2 border-green-400 shadow-xl shadow-green-100"
                          : "bg-white border border-gray-100 shadow-lg"
                    }`}
                  >
                    {isClaimed && (
                      <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <div className="bg-white px-6 py-3 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-2 transform rotate-12">
                          <CheckCircle className="text-green-500" />
                          <span className="font-bold text-gray-900">Completed!</span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                      {/* Icon */}
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${
                        isReadyToClaim ? "bg-green-100" : "bg-purple-100"
                      }`}>
                        {quest.emoji}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{quest.title}</h3>
                        <p className="text-sm text-gray-500 mb-4">{quest.description}</p>
                        
                        {/* Progress Bar */}
                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percent}%` }}
                              className={`h-full rounded-full ${
                                isReadyToClaim || isClaimed ? "bg-green-500" : "bg-purple-500"
                              }`}
                            />
                          </div>
                          <span className="text-sm font-bold text-gray-700 min-w-[50px] text-right">
                            {quest.progress} / {quest.target}
                          </span>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="shrink-0 w-full sm:w-auto mt-4 sm:mt-0 flex flex-col items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-yellow-100 px-3 py-1.5 rounded-lg border border-yellow-200">
                          <Coins size={16} className="text-yellow-600" />
                          <span className="font-bold text-yellow-700">+{quest.reward}</span>
                        </div>
                        
                        <button
                          disabled={!isReadyToClaim}
                          onClick={() => handleClaim(quest._id)}
                          className={`w-full px-6 py-2.5 rounded-xl font-bold transition-all ${
                            isReadyToClaim
                              ? "bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                              : isClaimed
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
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
      </div>
      <Footer />
    </>
  );
}
