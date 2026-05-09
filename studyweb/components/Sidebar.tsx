"use client";
import { Home, BookOpen, Store, User, Menu, X, Clock, Trophy, Search, Target, Shield, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import SearchUsersModal from "./SearchUsersModal";

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
            className={`relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
              isActive
                ? "text-[#C9984E] font-bold bg-amber-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium"
            }`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-base">{item.label}</span>
            {isActive && !isMobile && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-2 bottom-2 w-1.5 bg-[#C9984E] rounded-r-full"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </Link>
        );
      })}

      {userRole === "admin" && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Admin Panel</p>
          <Link href="/admin/achievements" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-semibold transition-colors">
            <Shield size={20} />
            <span className="text-sm">Achievements</span>
          </Link>
          <Link href="/admin/store" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-semibold transition-colors">
            <Shield size={20} />
            <span className="text-sm">Store</span>
          </Link>
          <Link href="/admin/quests" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-semibold transition-colors">
            <Shield size={20} />
            <span className="text-sm">Quests</span>
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* 🟢 Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-[280px] bg-white/80 backdrop-blur-xl border-r border-gray-200 shadow-xl z-50">
        
        {/* Logo Area */}
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-[#D4A574] to-[#B8873D] flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-xl">N</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xl font-black text-gray-900 truncate">NeuroSync</span>
              <span className="text-xs text-gray-500 font-medium truncate">Study & Share</span>
            </div>
          </motion.div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
          
          {/* Search Button */}
          {isSignedIn && (
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center justify-between px-4 py-3.5 mb-6 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-all border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <Search size={20} />
                <span className="font-medium text-sm">Search Users</span>
              </div>
              <span className="text-xs font-semibold bg-white px-2 py-1 rounded-md border border-gray-200 shadow-sm">Ctrl K</span>
            </button>
          )}

          <NavLinks />
        </div>

        {/* Bottom User Area */}
        <div className="p-4 border-t border-gray-200 bg-gray-50/50">
          {!isSignedIn ? (
            <div className="flex flex-col gap-2">
              <Link href="/sign-in" className="w-full text-center px-4 py-3 rounded-xl bg-gray-200 text-gray-800 font-bold hover:bg-gray-300 transition-colors">
                Sign In
              </Link>
              <Link href="/sign-up" className="w-full text-center px-4 py-3 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 text-white font-bold shadow-md hover:shadow-lg transition-all">
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm">
              <Link href="/profile" className="shrink-0">
                {currentUser?.profilePic ? (
                  <img
                    src={currentUser.profilePic}
                    alt="avatar"
                    className="w-10 h-10 rounded-xl object-cover border border-gray-200 hover:ring-2 hover:ring-[#C9984E] transition-all"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-[#C9984E]/20 text-[#C9984E] flex items-center justify-center font-bold">
                    {currentUser?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{currentUser?.name || "Loading..."}</p>
                <p className="text-xs text-gray-500 truncate">{currentUser?.email || "Student"}</p>
              </div>
              <button 
                onClick={handleSignOut}
                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* 🔴 Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4A574] to-[#B8873D] flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-lg">N</span>
            </div>
            <span className="text-lg font-black text-gray-900">NeuroSync</span>
          </div>

          <div className="flex items-center gap-2">
            {isSignedIn && (
              <button
                onClick={() => setSearchOpen(true)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Search size={20} />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="w-10 h-10 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center transition-colors hover:bg-gray-200"
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] bg-white z-[70] shadow-2xl flex flex-col lg:hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <span className="font-bold text-gray-900">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <NavLinks isMobile={true} />
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                {!isSignedIn ? (
                  <div className="flex gap-2">
                    <Link href="/sign-in" className="flex-1 text-center px-4 py-2.5 rounded-xl bg-gray-200 text-gray-800 font-bold">
                      Login
                    </Link>
                    <Link href="/sign-up" className="flex-1 text-center px-4 py-2.5 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 text-white font-bold">
                      Sign Up
                    </Link>
                  </div>
                ) : (
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-100 text-red-600 font-bold hover:bg-red-200 transition-colors"
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
