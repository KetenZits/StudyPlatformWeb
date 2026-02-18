"use client";
import { motion } from "framer-motion";
import { Mail, Calendar, Award, Flame, TrendingUp, Coins, Shield, Ban, Loader2, User2, Trophy, Zap, ArrowLeft, ShieldAlert, ShieldCheck } from "lucide-react";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import Navbar from "../../../../components/Navbar";
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

    const handleBan = async () => {
        setBanLoading(true);
        try {
            await banUser({ userId });
        } catch (err: any) {
            toast.error("Ban Failed", err.message || "Could not ban user");
        } finally {
            setBanLoading(false);
        }
    };

    const handleUnban = async () => {
        setBanLoading(true);
        try {
            await unbanUser({ userId });
        } catch (err: any) {
            toast.error("Unban Failed", err.message || "Could not unban user");
        } finally {
            setBanLoading(false);
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getRoleBadge = (role: string) => {
        const badges: Record<string, { gradient: string; icon: any }> = {
            Admin: { gradient: "from-red-500 to-pink-600", icon: Shield },
            moderator: { gradient: "from-purple-500 to-indigo-600", icon: Award },
            user: { gradient: "from-blue-500 to-cyan-500", icon: User2 },
        };
        return badges[role] || badges.user;
    };

    const getRelativeTime = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return "just now";
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return formatDate(timestamp);
    };

    const getActivityColor = (type: string) => {
        const colors: Record<string, string> = {
            posted: "from-purple-500 to-pink-500",
            answered: "from-blue-500 to-cyan-500",
            best_answer: "from-yellow-500 to-orange-500",
            earned_coins: "from-amber-500 to-orange-600",
        };
        return colors[type] || "from-gray-500 to-gray-600";
    };

    const getActivityIcon = (type: string) => {
        const icons: Record<string, string> = {
            posted: "❓",
            answered: "✅",
            best_answer: "⭐",
            earned_coins: "💰",
        };
        return icons[type] || "📝";
    };

    if (profile === undefined) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-16 h-16 text-orange-600 animate-spin mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Profile...</h2>
                    </div>
                </div>
            </>
        );
    }

    if (profile === null) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-6xl mb-4">😕</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
                        <p className="text-gray-600 mb-6">This user does not exist or has been removed.</p>
                        <Link href="/" className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold shadow-lg hover:shadow-xl transition-all">
                            Go Home
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    const roleBadge = getRoleBadge(profile.role);
    const RoleIcon = roleBadge.icon;
    const isAdmin = currentUser?.role === "Admin";
    const isOwnProfile = currentUser?._id === profile._id;

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 mt-15">
                {/* Decorative */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-300/20 to-amber-300/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-yellow-300/20 to-orange-300/20 rounded-full blur-3xl"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-24 md:pt-28 pb-16">

                    {/* Back button */}
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-6">
                        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors">
                            <ArrowLeft size={20} />
                            Back
                        </Link>
                    </motion.div>

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left - Profile Card */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden"
                        >
                            {/* Cover */}
                            <div className="h-40 bg-gradient-to-r from-[#D4A574] via-[#C9984E] to-[#B8873D] relative">
                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdjJoLTYweiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-50"></div>
                                {profile.banned && (
                                    <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg">
                                        <Ban size={16} /> BANNED
                                    </div>
                                )}
                            </div>

                            <div className="px-6 sm:px-8 pb-8">
                                {/* Profile Info */}
                                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-16 mb-6">
                                    <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                                        <div className="relative w-fit">
                                            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-[#D4A574] via-[#C9984E] to-[#B8873D] flex items-center justify-center shadow-2xl ring-4 ring-white overflow-hidden">
                                                {profile.profilePic ? (
                                                    <img src={profile.profilePic} alt={profile.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-white font-black text-4xl">{getInitials(profile.name)}</span>
                                                )}
                                            </div>
                                            {profile.banned && (
                                                <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-xl ring-4 ring-white">
                                                    <Ban size={18} className="text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="pb-2 mt-4 sm:mt-0 flex items-center gap-7 justify-center">
                                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 break-words">{profile.name}</h2>
                                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r ${roleBadge.gradient} shadow-md mb-3 relative top-[4px]`}>
                                                <RoleIcon size={16} className="text-white" />
                                                <span className="text-sm font-bold text-white uppercase">{profile.role}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Admin Ban/Unban button */}
                                    {isAdmin && !isOwnProfile && (
                                        <div>
                                            {profile.banned ? (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={handleUnban}
                                                    disabled={banLoading}
                                                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                                                >
                                                    <ShieldCheck size={18} />
                                                    {banLoading ? "Processing..." : "Unban User"}
                                                </motion.button>
                                            ) : (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={handleBan}
                                                    disabled={banLoading}
                                                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                                                >
                                                    <ShieldAlert size={18} />
                                                    {banLoading ? "Processing..." : "Ban User"}
                                                </motion.button>
                                            )}
                                        </div>
                                    )}

                                    {isOwnProfile && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4A574] via-[#C9984E] to-[#B8873D] text-white font-bold shadow-lg hover:shadow-xl transition-all"
                                        >
                                            <Link href="/profile/edit" className="flex items-center gap-2">
                                                Edit Profile
                                            </Link>
                                        </motion.button>
                                    )}
                                </div>

                                {/* Contact info */}
                                <div className="grid grid-cols-1 gap-4 mb-6">
                                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
                                        <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
                                            <Mail size={20} className="text-white" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-xs font-semibold text-gray-600 mb-1">Email</div>
                                            <div className="text-sm font-bold text-gray-900 truncate">{profile.email}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                                        <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                                            <Calendar size={20} className="text-white" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-xs font-semibold text-gray-600 mb-1">Member Since</div>
                                            <div className="text-sm font-bold text-gray-900">{formatDate(profile.createdAt)}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bio */}
                                {profile.bio && (
                                    <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                                        <h3 className="text-sm font-bold text-gray-700 mb-2">About Me</h3>
                                        <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Right - Stats & Achievements */}
                        <div className="lg:col-span-1 space-y-6">
                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-4">
                                {/* Coins */}
                                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                                            <Coins size={28} className="text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-semibold text-gray-600 mb-1">Total Coins</div>
                                            <div className="text-3xl font-black text-gray-900">{profile.coins}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Current Streak */}
                                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${profile.isStreakActive ? "from-red-500 to-orange-500" : "from-gray-400 to-gray-500"} flex items-center justify-center shadow-lg`}>
                                            <Flame size={28} className="text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-semibold text-gray-600 mb-1">Current Streak</div>
                                            <div className="text-3xl font-black text-gray-900">
                                                {profile.displayStreak} <span className="text-lg font-semibold text-gray-600">days</span>
                                            </div>
                                            {!profile.isStreakActive && profile.answerStreak > 0 && (
                                                <p className="text-xs text-red-500 font-semibold mt-1">Streak broken! (was {profile.answerStreak})</p>
                                            )}
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
                                            <div className="text-3xl font-black text-gray-900">{profile.bestStreak} <span className="text-lg font-semibold text-gray-600">days</span></div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Achievements */}
                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">Achievements</h3>
                                    <Link href={`/profile/achievements?userId=${userId}`} className="text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors">
                                        View All →
                                    </Link>
                                </div>
                                {userAchievements === undefined ? (
                                    <p className="text-sm text-gray-400">Loading...</p>
                                ) : userAchievements.length === 0 ? (
                                    <div className="text-center py-6">
                                        <Trophy className="mx-auto text-gray-300 mb-2" size={32} />
                                        <p className="text-sm text-gray-400">No achievements yet</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        {userAchievements.slice(0, 4).map((ua) => (
                                            <motion.div
                                                key={ua._id}
                                                whileHover={{ scale: 1.05, y: -2 }}
                                                className="aspect-square rounded-2xl bg-gray-50 hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-center gap-2 p-3"
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center shadow-md overflow-hidden">
                                                    {ua.achievement?.imageUrl ? (
                                                        <img src={ua.achievement.imageUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Trophy size={22} className="text-white" />
                                                    )}
                                                </div>
                                                <span className="text-xs font-bold text-gray-700 text-center leading-tight">{ua.achievement?.name}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>

                    {/* Activity & Overview Section */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Activity */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                                <Zap className="text-orange-500" size={24} />
                                Recent Activity
                            </h3>
                            {recentActivities === undefined ? (
                                <p className="text-sm text-gray-400">Loading...</p>
                            ) : recentActivities.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-400">No recent activity</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentActivities.map((activity, i) => (
                                        <div key={activity._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all">
                                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getActivityColor(activity.type)} flex items-center justify-center shadow-md flex-shrink-0`}>
                                                <span className="text-lg">{getActivityIcon(activity.type)}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-bold text-gray-900 truncate">{activity.message}</div>
                                                <div className="text-xs text-gray-500">{getRelativeTime(activity.createdAt)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                                <TrendingUp className="text-purple-500" size={24} />
                                Overview
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: "Questions Asked", value: profile.stats.questionsCount, icon: "❓", color: "from-blue-400 to-cyan-500" },
                                    { label: "Answers Given", value: profile.stats.answersCount, icon: "✅", color: "from-green-400 to-emerald-500" },
                                    { label: "Best Answers", value: profile.stats.bestCount, icon: "⭐", color: "from-yellow-400 to-orange-500" },
                                    { label: "Helpful Votes", value: profile.stats.helpfulVotes, icon: "👍", color: "from-pink-400 to-rose-500" },
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
                </div>
            </div>
            <Footer />
        </>
    );
}
