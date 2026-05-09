"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Square, Settings, Award, Users, RefreshCw } from "lucide-react";
import Sidebar from "../../../components/Sidebar";
import Footer from "../../../components/Footer";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useToast } from "../../../components/Toast";
import Link from "next/link";

// Timer states
type TimerMode = "work" | "break";
type TimerState = "idle" | "running" | "paused";

const WORK_TIME = 25 * 60; // 25 mins
const BREAK_TIME = 5 * 60; // 5 mins

export default function StudyRoomPage() {
  const { isSignedIn, user } = useUser();
  const toast = useToast();

  // Convex
  const activeStudiers = useQuery(api.studyRoom.getActiveStudiers);
  const myStats = useQuery(api.studyRoom.getMyTodayStats);
  const leaderboard = useQuery(api.studyRoom.getTodayLeaderboard);
  const startSession = useMutation(api.studyRoom.startSession);
  const endSession = useMutation(api.studyRoom.endSession);

  // Timer State
  const [mode, setMode] = useState<TimerMode>("work");
  const [state, setState] = useState<TimerState>("idle");
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  // Ref to track actual study time for the current session to send to DB
  const sessionDurationRef = useRef(0);

  // Handle Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (state === "running" && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        if (mode === "work") {
          sessionDurationRef.current += 1;
        }
      }, 1000);
    } else if (state === "running" && timeLeft === 0) {
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [state, timeLeft, mode]);

  // Sync session state to server when leaving page
  useEffect(() => {
    return () => {
      if (state === "running" && mode === "work" && sessionDurationRef.current > 0) {
        endSession({ durationSeconds: sessionDurationRef.current }).catch(console.error);
      }
    };
  }, [state, mode, endSession]);

  const handleTimerComplete = async () => {
    setState("idle");

    // Play sound (optional)
    try {
      const audio = new Audio('/sounds/bell.mp3');
      audio.play().catch(e => console.log("Audio play prevented"));
    } catch (e) { }

    if (mode === "work") {
      setCompletedPomodoros(prev => prev + 1);
      toast.success("Pomodoro Complete! 🍅", "Time for a short break.");

      // Save session
      if (isSignedIn && sessionDurationRef.current > 0) {
        await endSession({ durationSeconds: sessionDurationRef.current });
        sessionDurationRef.current = 0;
      }

      setMode("break");
      setTimeLeft(BREAK_TIME);
    } else {
      toast.success("Break Over!", "Ready to focus again?");
      setMode("work");
      setTimeLeft(WORK_TIME);
    }
  };

  const toggleTimer = async () => {
    if (!isSignedIn) {
      toast.warning("Sign In Required", "Please sign in to track your study sessions.");
      return;
    }

    if (state === "idle" || state === "paused") {
      setState("running");
      if (mode === "work" && state === "idle") {
        sessionDurationRef.current = 0;
        await startSession();
      } else if (mode === "work" && state === "paused") {
        await startSession(); // Resume active status on server
      }
    } else {
      setState("paused");
      if (mode === "work") {
        await endSession({ durationSeconds: sessionDurationRef.current });
        sessionDurationRef.current = 0;
      }
    }
  };

  const resetTimer = async () => {
    if (state === "running" && mode === "work") {
      await endSession({ durationSeconds: sessionDurationRef.current });
      sessionDurationRef.current = 0;
    }
    setState("idle");
    setTimeLeft(mode === "work" ? WORK_TIME : BREAK_TIME);
  };

  const switchMode = async (newMode: TimerMode) => {
    if (state === "running" && mode === "work") {
      await endSession({ durationSeconds: sessionDurationRef.current });
      sessionDurationRef.current = 0;
    }
    setMode(newMode);
    setState("idle");
    setTimeLeft(newMode === "work" ? WORK_TIME : BREAK_TIME);
  };

  // Format time (MM:SS)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Format long duration (e.g. 2h 15m)
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  // Progress circle math
  const totalTime = mode === "work" ? WORK_TIME : BREAK_TIME;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <>
      <Sidebar />
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 pt-20 lg:pt-12 pb-16 font-sans lg:pl-[280px]">

        {/* Deep Focus Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-300/20 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-300/20 blur-[120px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8">

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">
              Study Room <span className="text-orange-500">⚡</span>
            </h1>
            <p className="text-gray-600 text-lg">
              Focus, track your time, and study alongside others.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column - Active Studiers */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-white/50 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Users size={18} className="text-orange-500" />
                    Active Now
                  </h3>
                  <div className="flex items-center gap-2 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs font-bold text-orange-700">{activeStudiers?.length || 0}</span>
                  </div>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {activeStudiers === undefined ? (
                    <div className="text-center text-gray-500 py-4 text-sm">Loading...</div>
                  ) : activeStudiers.length === 0 ? (
                    <div className="text-center text-gray-500 py-4 text-sm">It&apos;s quiet here. Be the first to start studying!</div>
                  ) : (
                    activeStudiers.map((studier, i) => (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={studier.userId}
                        className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3 border border-gray-100"
                      >
                        <div className="relative">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center overflow-hidden shadow-sm">
                            {studier.profilePic ? (
                              <img src={studier.profilePic} alt={studier.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-white font-bold text-sm">{studier.name[0].toUpperCase()}</span>
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{studier.name}</p>
                          <p className="text-xs text-gray-500">Focusing right now</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* My Stats Card */}
              {isSignedIn && myStats && (
                <div className="bg-gradient-to-br from-[#D4A574] via-[#C9984E] to-[#B8873D] rounded-3xl border border-white/50 p-6 shadow-xl shadow-amber-300/30 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>

                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Today&apos;s Progress</h3>

                  <div className="flex items-end gap-3 mb-2">
                    <span className="text-4xl font-black text-white leading-none">
                      {Math.floor(myStats.totalSeconds / 60)}
                    </span>
                    <span className="text-amber-50 font-bold mb-1">mins studied</span>
                  </div>

                  <div className="flex items-center gap-2 mt-4 text-sm text-amber-50">
                    <Award size={16} />
                    <span>{myStats.sessions} sessions completed</span>
                  </div>
                </div>
              )}
            </div>

            {/* Center Column - Timer */}
            <div className="lg:col-span-1 flex flex-col items-center">

              {/* Mode Switcher */}
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl mb-12 border border-gray-200 shadow-sm">
                <button
                  onClick={() => switchMode("work")}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === "work"
                    ? "bg-[#C9984E] text-white shadow-lg"
                    : "text-gray-500 hover:text-gray-900"
                    }`}
                >
                  Pomodoro
                </button>
                <button
                  onClick={() => switchMode("break")}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === "break"
                    ? "bg-green-500 text-white shadow-lg"
                    : "text-gray-500 hover:text-gray-900"
                    }`}
                >
                  Short Break
                </button>
              </div>

              {/* Circular Timer */}
              <div className="relative flex items-center justify-center mb-12">
                {/* Outer Glow */}
                <div className={`absolute inset-0 rounded-full blur-[50px] opacity-20 transition-colors duration-1000 ${state === "running" ? (mode === "work" ? "bg-[#C9984E]" : "bg-green-500") : "bg-transparent"
                  }`}></div>

                {/* SVG Circle */}
                <svg width="300" height="300" className="transform -rotate-90 relative z-10">
                  {/* Background Circle */}
                  <circle
                    cx="150" cy="150" r={radius}
                    fill="transparent"
                    stroke="#E5E7EB"
                    strokeWidth="12"
                  />
                  {/* Progress Circle */}
                  <motion.circle
                    cx="150" cy="150" r={radius}
                    fill="transparent"
                    stroke={mode === "work" ? "#C9984E" : "#22C55E"}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </svg>

                {/* Time Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                  <div className={`text-6xl sm:text-7xl font-black tracking-tighter tabular-nums transition-colors duration-300 ${state === "running" ? "text-gray-900" : "text-gray-400"
                    }`}>
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-gray-500 font-medium uppercase tracking-widest text-xs mt-2">
                    {mode === "work" ? "Focus Session" : "Break Time"}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleTimer}
                  className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl transition-colors ${state === "running"
                    ? "bg-white border-2 border-orange-200 text-orange-600 hover:bg-gray-50"
                    : mode === "work"
                      ? "bg-[#C9984E] hover:bg-[#B8873D] text-white"
                      : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                >
                  {state === "running" ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-2" />}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetTimer}
                  className="w-14 h-14 rounded-2xl bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw size={24} />
                </motion.button>
              </div>

              {/* Pomodoros completed badge */}
              <div className="mt-8 flex items-center gap-2">
                <span className="text-sm text-gray-500 font-medium">Completed:</span>
                <div className="flex gap-1">
                  {[...Array(Math.max(4, completedPomodoros))].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${i < completedPomodoros ? "bg-[#C9984E]" : "bg-gray-200"
                        }`}
                    ></div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column - Leaderboard */}
            <div className="lg:col-span-1">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-white/50 p-6 shadow-xl h-full max-h-[600px] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Award size={18} className="text-orange-500" />
                    Today&apos;s Leaders
                  </h3>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                  {leaderboard === undefined ? (
                    <div className="text-center text-gray-500 py-4 text-sm">Loading...</div>
                  ) : leaderboard.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                      <div className="text-4xl mb-3 opacity-50">🏆</div>
                      <p className="text-sm">No one has studied today.</p>
                      <p className="text-xs mt-1 text-gray-400">Be the first on the board!</p>
                    </div>
                  ) : (
                    leaderboard.map((user, i) => (
                      <div
                        key={user.userId}
                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${i === 0
                          ? "bg-gradient-to-r from-orange-50 to-transparent border-orange-200"
                          : i === 1
                            ? "bg-gray-50 border-gray-200"
                            : i === 2
                              ? "bg-gray-50 border-gray-100"
                              : "border-transparent hover:bg-gray-50"
                          }`}
                      >
                        <div className={`w-6 text-center font-black text-sm ${i === 0 ? "text-orange-500" : i === 1 ? "text-gray-500" : i === 2 ? "text-amber-600" : "text-gray-400"
                          }`}>
                          #{i + 1}
                        </div>

                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center overflow-hidden border border-white shadow-sm">
                          {user.profilePic ? (
                            <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-orange-600 font-bold text-sm">{user.name[0].toUpperCase()}</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold truncate ${i === 0 ? "text-orange-600" : "text-gray-900"}`}>
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 font-medium">
                            {formatDuration(user.totalSeconds)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
