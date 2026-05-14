"use client";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { Bell, CheckCheck, MessageCircle, Star, ThumbsUp, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top?: number, bottom?: number, left: number }>({ top: 0, left: 0 });

  const notifications = useQuery(api.notifications.getMyNotifications, { limit: 20 });
  const unreadCount = useQuery(api.notifications.getUnreadCount);
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  // Calculate position from button
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 1024;
      const panelHeight = 480; // Max height estimate
      const spaceBelow = window.innerHeight - rect.bottom;
      
      let positionConfig: any = { left: isMobile ? 16 : rect.left };
      
      if (spaceBelow < panelHeight && rect.top > spaceBelow) {
        // Render ABOVE the button
        positionConfig.bottom = window.innerHeight - rect.top + 8;
      } else {
        // Render BELOW the button
        positionConfig.top = rect.bottom + 8;
      }

      setPos(positionConfig);
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const handleNotificationClick = async (notiId: Id<"notifications">, read: boolean) => {
    if (!read) await markAsRead({ notificationId: notiId });
    setIsOpen(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "new_answer": return <MessageCircle size={16} className="text-blue-500" />;
      case "best_answer": return <Star size={16} className="text-yellow-500" />;
      case "like_answer": return <ThumbsUp size={16} className="text-pink-500" />;
      default: return <Bell size={16} className="text-gray-500" />;
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
    return new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Width for the dropdown
  const panelWidth = typeof window !== "undefined" && window.innerWidth < 1024
    ? window.innerWidth - 32
    : 384;

  const dropdownPanel = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl overflow-hidden"
          style={{
            position: "fixed",
            ...(pos.top !== undefined ? { top: pos.top } : {}),
            ...(pos.bottom !== undefined ? { bottom: pos.bottom } : {}),
            left: pos.left,
            width: panelWidth,
            zIndex: 9999,
            background: "var(--nm-bg)",
            boxShadow: "8px 8px 16px var(--nm-shadow-dark), -8px -8px 16px var(--nm-shadow-light)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-300/40">
            <h3 className="text-base font-black text-gray-800">Notifications</h3>
            <div className="flex items-center gap-2">
              {(unreadCount ?? 0) > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-800 transition-colors px-2 py-1 rounded-lg hover:bg-purple-100/30"
                >
                  <CheckCheck size={14} />
                  Read all
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
                style={{ boxShadow: "2px 2px 4px var(--nm-shadow-dark), -2px -2px 4px var(--nm-shadow-light)" }}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications === undefined ? (
              <div className="text-center py-10 text-gray-400 text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">🔔</div>
                <p className="text-sm font-bold text-gray-500">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">When someone answers your question, you&apos;ll see it here</p>
              </div>
            ) : (
              notifications.map((noti, i) => (
                <motion.div
                  key={noti._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    href={noti.relatedPostId ? `/posts/${noti.relatedPostId}` : "#"}
                    onClick={() => handleNotificationClick(noti._id, noti.read)}
                  >
                    <div
                      className={`flex items-start gap-3 px-5 py-3.5 transition-all cursor-pointer border-b border-gray-200/30 ${
                        !noti.read
                          ? "bg-purple-50/20 hover:bg-purple-50/40"
                          : "hover:bg-white/20 opacity-70"
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className="w-9 h-9 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                        style={{
                          background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                          boxShadow: "2px 2px 4px var(--nm-shadow-dark), -2px -2px 4px var(--nm-shadow-light)",
                        }}
                      >
                        {noti.fromUserPic ? (
                          <img src={noti.fromUserPic} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white font-bold text-xs">
                            {noti.fromUserName?.[0]?.toUpperCase() || "?"}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 leading-snug">
                          <span className="font-bold text-gray-800">{noti.fromUserName}</span>{" "}
                          {noti.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          {getIcon(noti.type)}
                          <span className="text-xs text-gray-400 font-medium">{timeAgo(noti.createdAt)}</span>
                        </div>
                      </div>

                      {/* Unread dot */}
                      {!noti.read && (
                        <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 shrink-0 mt-1.5" />
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
          
          {/* Footer Link */}
          {notifications && notifications.length > 0 && (
            <div className="border-t border-gray-300/40 p-2">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="block text-center text-sm font-bold text-purple-600 hover:text-purple-800 transition-colors py-2 hover:bg-purple-50/50 rounded-xl"
              >
                View all notifications →
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-800 transition-all"
        style={{
          background: "var(--nm-bg)",
          boxShadow: isOpen
            ? "inset 3px 3px 6px var(--nm-shadow-dark), inset -3px -3px 6px var(--nm-shadow-light)"
            : "3px 3px 6px var(--nm-shadow-dark), -3px -3px 6px var(--nm-shadow-light)",
        }}
      >
        <Bell size={20} />
        {(unreadCount ?? 0) > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-black flex items-center justify-center shadow-md"
          >
            {unreadCount! > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Portal dropdown — renders outside sidebar to avoid overflow clipping */}
      {typeof document !== "undefined" && createPortal(dropdownPanel, document.body)}
    </>
  );
}
