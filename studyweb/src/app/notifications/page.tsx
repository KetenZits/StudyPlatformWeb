"use client";
import { motion } from "framer-motion";
import { Bell, CheckCheck, MessageCircle, Star, ThumbsUp } from "lucide-react";
import React from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import Sidebar from "../../../components/Sidebar";
import Footer from "../../../components/Footer";
import { useUser } from "@clerk/nextjs";

export default function NotificationsPage() {
  const { isSignedIn } = useUser();
  const notifications = useQuery(api.notifications.getMyNotifications, { limit: 100 });
  const unreadCount = useQuery(api.notifications.getUnreadCount);
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const handleNotificationClick = async (notiId: Id<"notifications">, read: boolean) => {
    if (!read) await markAsRead({ notificationId: notiId });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "new_answer": return <MessageCircle size={18} className="text-blue-500" />;
      case "best_answer": return <Star size={18} className="text-yellow-500" />;
      case "like_answer": return <ThumbsUp size={18} className="text-pink-500" />;
      default: return <Bell size={18} className="text-gray-500" />;
    }
  };

  const timeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[var(--nm-bg)] flex items-center justify-center">
        <div className="text-center nm-raised p-10 max-w-md mx-auto">
          <Bell className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-gray-800 mb-4 tracking-tight">Notifications</h2>
          <p className="text-gray-500 mb-8 font-medium">Please sign in to view your notifications.</p>
          <Link href="/sign-in">
            <button className="px-8 py-3 rounded-xl nm-gradient-btn w-full">Sign In</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="min-h-screen bg-[var(--nm-bg)] lg:pl-[280px]">
        <div className="max-w-4xl mx-auto px-5 md:px-8 pt-20 md:pt-12 pb-16">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl sm:text-5xl font-black text-gray-800 tracking-tight flex items-center gap-3">
                  <Bell className="text-purple-500" size={36} /> Notifications
                </h1>
                <p className="text-gray-500 text-lg font-medium mt-2">
                  Stay updated with your activities and rewards ✨
                </p>
              </div>
              {(unreadCount ?? 0) > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl nm-btn text-purple-600 hover:text-purple-800 font-bold transition-all"
                >
                  <CheckCheck size={18} />
                  Mark all as read
                </button>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="nm-raised overflow-hidden">
            <div className="p-6 border-b border-gray-300/40 bg-white/5">
              <h2 className="text-xl font-bold text-gray-800">
                All Notifications {unreadCount !== undefined && unreadCount > 0 && <span className="ml-2 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-black">{unreadCount} new</span>}
              </h2>
            </div>
            
            <div className="divide-y divide-gray-300/40">
              {notifications === undefined ? (
                <div className="p-10 text-center text-gray-500 font-medium">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="text-6xl mb-4 opacity-50">📭</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">You're all caught up!</h3>
                  <p className="text-gray-500">When someone interacts with you, it will show up here.</p>
                </div>
              ) : (
                notifications.map((noti, i) => (
                  <motion.div
                    key={noti._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <Link
                      href={noti.relatedPostId ? `/posts/${noti.relatedPostId}` : "#"}
                      onClick={() => handleNotificationClick(noti._id, noti.read)}
                      className={`block p-5 sm:p-6 transition-all hover:bg-white/10 ${!noti.read ? "bg-purple-50/20" : ""}`}
                    >
                      <div className="flex gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden"
                          style={{
                            background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                            boxShadow: "3px 3px 6px var(--nm-shadow-dark), -3px -3px 6px var(--nm-shadow-light)",
                          }}
                        >
                          {noti.fromUserPic ? (
                            <img src={noti.fromUserPic} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-bold text-lg">
                              {noti.fromUserName?.[0]?.toUpperCase() || "?"}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-base text-gray-700 leading-snug">
                            <span className="font-bold text-gray-800">{noti.fromUserName}</span>{" "}
                            {noti.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {getIcon(noti.type)}
                            <span className="text-sm text-gray-500 font-medium">{timeAgo(noti.createdAt)}</span>
                          </div>
                        </div>

                        {!noti.read && (
                          <div className="flex-shrink-0 flex items-center">
                            <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
}
