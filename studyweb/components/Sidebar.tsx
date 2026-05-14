"use client";
import { Home, BookOpen, Store, User, Menu, X, Clock, Trophy, Search, Target, Shield, LogOut, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import SearchUsersModal from "./SearchUsersModal";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";

export default function Sidebar() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const [activeTab, setActiveTab] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { isSignedIn } = useUser();
  const userRole = useQuery(api.users.getUserRole);

  const navItems = [
    { id: "home", label: "Home", icon: Home, link: "/", requireAuth: false },
    { id: "posts", label: "Posts", icon: BookOpen, link: "/posts", requireAuth: true },
    { id: "Top", label: "Leaderboard", icon: Trophy, link: "/leaderboard", requireAuth: false },
    { id: "store", label: "Store", icon: Store, link: "/store", requireAuth: false },
    { id: "study-room", label: "Study Room", icon: Clock, link: "/study-room", requireAuth: false },
    { id: "quests", label: "Quests", icon: Target, link: "/quests", requireAuth: true },
    { id: "profile", label: "Profile", icon: User, link: "/profile", requireAuth: true },
  ];

  useEffect(() => {
    if (pathname === "/") setActiveTab("home");
    else if (pathname.startsWith("/posts")) setActiveTab("posts");
    else if (pathname.startsWith("/leaderboard")) setActiveTab("leaderboard");
    else if (pathname.startsWith("/store")) setActiveTab("store");
    else if (pathname.startsWith("/study-room")) setActiveTab("study-room");
    else if (pathname.startsWith("/quests")) setActiveTab("quests");
    else if (pathname.startsWith("/profile")) setActiveTab("profile");
  }, [pathname]);

  const handleNavClick = (item: typeof navItems[number], e?: React.MouseEvent) => {
    if (item.requireAuth && !isSignedIn) {
      e?.preventDefault();
      router.push("/sign-in");
      return;
    }
    setActiveTab(item.id);
    setMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    signOut(() => router.push("/"));
  };

  const NavLinks = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <Link
            key={item.id}
            href={item.link}
            onClick={(e) => handleNavClick(item, e)}
            className={`relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${
              isActive
                ? "nm-btn-pressed text-purple-600 font-bold"
                : "text-gray-500 hover:text-gray-800 font-medium hover:bg-white/30"
            }`}
            style={isActive ? { boxShadow: 'inset 3px 3px 6px var(--nm-shadow-dark), inset -3px -3px 6px var(--nm-shadow-light)' } : {}}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-base">{item.label}</span>
            {isActive && !isMobile && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-2 bottom-2 w-1.5 rounded-r-full"
                style={{ background: 'linear-gradient(180deg, #8b5cf6, #3b82f6)' }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </Link>
        );
      })}

      {(userRole === "admin" || userRole === "Admin" || userRole === "developer" || userRole === "Developer") && (
        <div className="mt-6 pt-6 border-t border-gray-300/50">
          <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Admin Panel</p>
          <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl font-semibold transition-all mb-1 text-white"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1, #3b82f6)', boxShadow: '3px 3px 6px var(--nm-shadow-dark), -3px -3px 6px var(--nm-shadow-light)' }}>
            <LayoutDashboard size={20} />
            <span className="text-sm">Dashboard</span>
          </Link>
          <Link href="/admin/achievements" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-100/30 font-semibold transition-colors">
            <Shield size={20} />
            <span className="text-sm">Achievements</span>
          </Link>
          <Link href="/admin/store" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-100/30 font-semibold transition-colors">
            <Shield size={20} />
            <span className="text-sm">Store</span>
          </Link>
          <Link href="/admin/quests" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-100/30 font-semibold transition-colors">
            <Shield size={20} />
            <span className="text-sm">Quests</span>
          </Link>
          <Link href="/admin/reports" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-100/30 font-semibold transition-colors">
            <Shield size={20} />
            <span className="text-sm">Reports</span>
          </Link>
          <Link href="/admin/users" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-100/30 font-semibold transition-colors">
            <Shield size={20} />
            <span className="text-sm">Users</span>
          </Link>
          <Link href="/admin/categories" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-100/30 font-semibold transition-colors">
            <Shield size={20} />
            <span className="text-sm">Categories</span>
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* 🟢 Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-[280px] bg-[var(--nm-bg)] z-50"
        style={{ boxShadow: '6px 0 16px var(--nm-shadow-dark), -2px 0 8px var(--nm-shadow-light)' }}
      >
        
        {/* Logo Area */}
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center nm-circle"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}
            >
              <span className="text-white font-black text-xl">N</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xl font-black text-gray-800 truncate">NeuroSync</span>
              <span className="text-xs text-gray-500 font-medium truncate">Study & Share</span>
            </div>
          </motion.div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
          
          {/* Search Button */}
            {isSignedIn && (
            <div className="mb-6">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl nm-btn text-gray-500 hover:text-gray-800 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Search size={20} />
                  <span className="font-medium text-sm">Search Users</span>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-md nm-inset-xs text-gray-500">Ctrl K</span>
              </button>
            </div>
          )}

          <NavLinks />
        </div>

        {/* Bottom User Area */}
        <div className="p-4 border-t border-gray-300/40 flex flex-col gap-4">
          {isSignedIn && (
            <div className="flex items-center justify-center gap-4">
              <ThemeToggle />
              <NotificationBell />
            </div>
          )}
          {!isSignedIn ? (
            <div className="flex flex-col gap-2">
              <Link href="/sign-in" className="w-full text-center px-4 py-3 rounded-xl nm-btn text-gray-800 font-bold hover:text-purple-600 transition-colors">
                Sign In
              </Link>
              <Link href="/sign-up" className="w-full text-center px-4 py-3 rounded-xl nm-gradient-btn">
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-2 rounded-2xl nm-raised-xs">
              <Link href="/profile" className="shrink-0">
                {currentUser?.profilePic ? (
                  <img
                    src={currentUser.profilePic}
                    alt="avatar"
                    className="w-10 h-10 rounded-xl object-cover hover:ring-2 hover:ring-purple-400 transition-all"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center font-bold">
                    {currentUser?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{currentUser?.name || "Loading..."}</p>
                <p className="text-xs text-gray-500 truncate">{currentUser?.email || "Student"}</p>
              </div>
              <button 
                onClick={handleSignOut}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50/50 rounded-xl transition-colors"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* 🔴 Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[var(--nm-bg)]"
        style={{ boxShadow: '0 4px 12px var(--nm-shadow-dark)' }}
      >
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', boxShadow: '3px 3px 6px var(--nm-shadow-dark), -3px -3px 6px var(--nm-shadow-light)' }}
            >
              <span className="text-white font-black text-lg">N</span>
            </div>
            <span className="text-lg font-black text-gray-800">NeuroSync</span>
          </div>

          <div className="flex items-center gap-2">
            {isSignedIn && (
              <button
                onClick={() => setSearchOpen(true)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 nm-btn transition-colors"
              >
              <Search size={20} />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="w-10 h-10 rounded-xl text-gray-700 flex items-center justify-center nm-btn transition-colors"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* 🔴 Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] bg-[var(--nm-bg)] z-[70] flex flex-col lg:hidden"
              style={{ boxShadow: '-8px 0 20px var(--nm-shadow-dark)' }}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-300/40">
                <span className="font-bold text-gray-800">Menu</span>
                <div className="flex items-center gap-3">
                  {isSignedIn && (
                    <>
                      <ThemeToggle />
                      <NotificationBell />
                    </>
                  )}
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-10 h-10 rounded-xl nm-btn flex items-center justify-center text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <NavLinks isMobile={true} />
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-gray-300/40">
                {!isSignedIn ? (
                  <div className="flex gap-2">
                    <Link href="/sign-in" className="flex-1 text-center px-4 py-2.5 rounded-xl nm-btn text-gray-800 font-bold">
                      Login
                    </Link>
                    <Link href="/sign-up" className="flex-1 text-center px-4 py-2.5 rounded-xl nm-gradient-btn">
                      Sign Up
                    </Link>
                  </div>
                ) : (
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl nm-btn text-red-500 font-bold hover:text-red-600 transition-colors"
                  >
                    <LogOut size={20} />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SearchUsersModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
