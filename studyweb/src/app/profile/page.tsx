"use client";
import { motion } from "framer-motion";
import { Edit, Mail, Calendar, Award, Flame, TrendingUp, Coins, Shield, Ban, Loader2, User2, Trophy, Star, Target, Zap } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

export default function ProfilePage() {
  const { user } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);
  const createUser = useMutation(api.users.createUser);
  const [created, setCreated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    bio: "",
  });

  // สร้าง user ใหม่ถ้ายังไม่มีใน DB
  useEffect(() => {
    if (user && currentUser === null && !created) {
      createUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "unknown",
        name: user.firstName || "NoName",
        profilePic: user.imageUrl,
        coins: 0,
        answerStreak: 0,
        bestStreak: 0,
        role: "user",
        banned: false,
        createdAt: Date.now(),
      }).then(() => setCreated(true));
    }
  }, [user, currentUser, createUser, created]);

  // Set edit data เมื่อมีข้อมูล user
  useEffect(() => {
    if (currentUser) {
      setEditData({
        name: currentUser.name,
        email: currentUser.email,
        bio: currentUser.bio || "",
      });
    }
  }, [currentUser]);

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Role badge color
  const getRoleBadge = (role: string) => {
    const badges = {
      admin: { gradient: "from-red-500 to-pink-600", icon: Shield },
      moderator: { gradient: "from-purple-500 to-indigo-600", icon: Award },
      user: { gradient: "from-blue-500 to-cyan-500", icon: User2 },
    };
    return badges[role as keyof typeof badges] || badges.user;
  };

  // Loading state
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h2>
          <p className="text-gray-600">You need to be logged in to view your profile</p>
        </div>
      </div>
    );
  }

  if (currentUser === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-orange-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Profile...</h2>
          <p className="text-gray-600">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (currentUser === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-orange-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Creating Profile...</h2>
          <p className="text-gray-600">Setting up your account</p>
        </div>
      </div>
    );
  }

  const roleBadge = getRoleBadge(currentUser.role);
  const RoleIcon = roleBadge.icon;

  const achievements = [
    { icon: Trophy, color: "from-yellow-400 to-orange-500", label: "Top Contributor" },
    { icon: Star, color: "from-purple-400 to-pink-500", label: "5 Day Streak" },
    { icon: Target, color: "from-blue-400 to-cyan-500", label: "100 Answers" },
    { icon: Zap, color: "from-green-400 to-emerald-500", label: "Fast Responder" },
  ];

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 mt-15">
      
      {/* Decorative Background Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-300/20 to-amber-300/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-yellow-300/20 to-orange-300/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-24 md:pt-28 pb-16">
        
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-5xl">👤</span>
            <div>
              <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
                Profile <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Overview</span>
              </h1>
            </div>
          </div>
          <p className="text-gray-600 text-lg font-medium">
            Manage your account and track your learning journey ✨
          </p>
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left - Profile Card (Full Width) */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden"
          >
            {/* Cover with Gradient */}
            <div className="h-40 bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdjJoLTYweiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-50"></div>
            </div>

            <div className="px-6 sm:px-8 pb-8">
              {/* Profile Info */}
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-16 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                  {/* Avatar */}
                  <div className="relative w-fit">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-2xl ring-4 ring-white overflow-hidden">
                      {currentUser.profilePic ? (
                        <img src={currentUser.profilePic} alt={currentUser.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-black text-4xl">{getInitials(currentUser.name)}</span>
                      )}
                    </div>
                    {currentUser.banned && (
                      <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-xl ring-4 ring-white">
                        <Ban size={18} className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* Name & Basic Info */}
                  <div className="pb-2 mt-4 sm:mt-0 flex items-center gap-7 justify-center">
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 break-words">{currentUser.name}</h2>
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r ${roleBadge.gradient} shadow-md mb-3 relative top-[4px]`}>
                      <RoleIcon size={16} className="text-white" />
                      <span className="text-sm font-bold text-white uppercase">{currentUser.role}</span>
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                >
                  <Edit size={18} />
                  <span>Edit</span>
                </motion.button>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 gap-4 mb-6">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
                  <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
                    <Mail size={20} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-gray-600 mb-1">Email</div>
                    <div className="text-sm font-bold text-gray-900 truncate">{currentUser.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                  <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                    <Calendar size={20} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-gray-600 mb-1">Member Since</div>
                    <div className="text-sm font-bold text-gray-900">{formatDate(currentUser.createdAt)}</div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {currentUser.bio && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-2">About Me</h3>
                  <p className="text-gray-700 leading-relaxed">{currentUser.bio}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right - Stats & Achievements */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Stats Cards */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              {/* Coins */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <Coins size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-600 mb-1">Total Coins</div>
                    <div className="text-3xl font-black text-gray-900">{currentUser.coins}</div>
                  </div>
                </div>
              </div>

              {/* Current Streak */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <Flame size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-600 mb-1">Current Streak</div>
                    <div className="text-3xl font-black text-gray-900">{currentUser.answerStreak} <span className="text-lg font-semibold text-gray-600">days</span></div>
                  </div>
                </div>
              </div>

              {/* Best Streak */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <TrendingUp size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-600 mb-1">Best Streak</div>
                    <div className="text-3xl font-black text-gray-900">{currentUser.bestStreak} <span className="text-lg font-semibold text-gray-600">days</span></div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Achievements</h3>
              <div className="grid grid-cols-2 gap-3">
                {achievements.map((achievement, i) => {
                  const Icon = achievement.icon;
                  return (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="aspect-square rounded-2xl bg-gradient-to-br bg-gray-50 hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-center gap-2 p-3"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${achievement.color} flex items-center justify-center shadow-md`}>
                        <Icon size={22} className="text-white" />
                      </div>
                      <span className="text-xs font-bold text-gray-700 text-center leading-tight">{achievement.label}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

          </div>

        </div>

        {/* Activity Feed Section - Desktop Only */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Recent Activity */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Zap className="text-orange-500" size={24} />
              Recent Activity
            </h3>
            <div className="space-y-4">
              {[
                { action: "Answered a question", topic: "Mathematics", time: "2 hours ago", color: "from-blue-500 to-cyan-500" },
                { action: "Asked a question", topic: "Physics", time: "5 hours ago", color: "from-purple-500 to-pink-500" },
                { action: "Earned 10 coins", topic: "Best Answer", time: "1 day ago", color: "from-amber-500 to-orange-600" },
              ].map((activity, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${activity.color} flex items-center justify-center shadow-md flex-shrink-0`}>
                    <span className="text-white font-bold text-sm">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-900 truncate">{activity.action}</div>
                    <div className="text-xs text-gray-500">{activity.topic} • {activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <TrendingUp className="text-purple-500" size={24} />
              Overview
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Questions Asked", value: "12", icon: "❓", color: "from-blue-400 to-cyan-500" },
                { label: "Answers Given", value: "45", icon: "✅", color: "from-green-400 to-emerald-500" },
                { label: "Best Answers", value: "8", icon: "⭐", color: "from-yellow-400 to-orange-500" },
                { label: "Helpful Votes", value: "127", icon: "👍", color: "from-pink-400 to-rose-500" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-md transition-all"
                >
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-black text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-xs font-semibold text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Edit Form */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h3>
            
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className="w-full px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    console.log("Save:", editData);
                    setIsEditing(false);
                  }}
                  className="flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3.5 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
    <Footer/>
    </>
  );
}