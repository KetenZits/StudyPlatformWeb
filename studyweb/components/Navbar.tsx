"use client";
import { Home, BookOpen, Store, User, Menu, X, Clock, Trophy, Search, Target, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import SearchUsersModal from "./SearchUsersModal";


export default function Navbar() {

  const currentUser = useQuery(api.users.getCurrentUser);
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { isSignedIn } = useUser();
  const userRole = useQuery(api.users.getUserRole);

  const navItems = [
    { id: "home", label: "Home", icon: Home, link: "/", requireAuth: false },
    { id: "posts", label: "Posts", icon: BookOpen, link: "/posts", requireAuth: true },
    { id: "Top", label: "Top", icon: Trophy, link: "/leaderboard", requireAuth: false },
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



  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden lg:block fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-lg py-1">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4A574] to-[#B8873D] flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-xl">N</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-gray-900">NeuroSync</span>
                <span className="text-xs text-gray-500 font-medium">Learn & Share Knowledge</span>
              </div>
            </motion.div>

            {/* Nav Items */}
            <div className="flex items-center gap-2">
              {navItems.map((item, i) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <Link
                    key={item.id}
                    href={item.link}
                    onClick={(e) => handleNavClick(item, e)}
                    className={`relative flex items-center gap-3 px-6 py-3 rounded-xl transition-all ${isActive
                      ? "text-[#C9984E] font-bold"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="text-sm font-semibold">{item.label}</span>
                    </motion.div>

                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl -z-10 border-2 border-[#C9984E]/30"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}


              {/* Admin Links */}
              {userRole === "admin" && (
                <div className="flex items-center gap-2">
                  <Link href="/admin/achievements" className="flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 font-bold text-sm transition-colors">
                    <Shield size={16} />
                    <span>Achievements</span>
                  </Link>
                  <Link href="/admin/store" className="flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 font-bold text-sm transition-colors">
                    <Shield size={16} />
                    <span>Store</span>
                  </Link>
                  <Link href="/admin/quests" className="flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 font-bold text-sm transition-colors">
                    <Shield size={16} />
                    <span>Quests</span>
                  </Link>
                </div>
              )}

              {/* Search Button */}
              {isSignedIn && (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-3 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all"
                  title="Find people"
                >
                  <Search size={22} />
                </button>
              )}

              {/* Auth Buttons */}
              {!isSignedIn ? (
                <>
                  <Link href="/sign-in" className="px-4 py-2 rounded-xl bg-gradient-to-br from-yellow-700 to-yellow-600 text-white">
                    Sign In
                  </Link>
                  <Link href="/sign-up" className="px-4 py-2 rounded-xl bg-gradient-to-bl from-amber-700 to-amber-600 text-white">
                    Sign Up
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  {currentUser?.profilePic && (
                    <Link href="/profile">
                      <img
                        src={currentUser.profilePic}
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover border-2 border-[#C9984E] cursor-pointer hover:scale-105 transition-transform"
                      />
                    </Link>
                  )}
                  <SignOutButton>
                    <button className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700">
                      Logout
                    </button>
                  </SignOutButton>
                </div>
              )}

            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-lg py-2">
        <div className="flex items-center justify-between h-16 px-5">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4A574] to-[#B8873D] flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-lg">N</span>
            </div>
            <span className="text-lg font-black text-gray-900">NeuroSync</span>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden bg-white border-t border-gray-100"
            >
              <div className="px-5 py-4 space-y-2">
                {userRole === "admin" && (
                  <>
                    <div className="px-3 mb-2 mt-4">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Admin</span>
                    </div>
                    <Link href="/admin/achievements">
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 font-bold transition-colors">
                        <Shield size={18} /> Manage Achievements
                      </button>
                    </Link>
                    <Link href="/admin/store">
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 font-bold transition-colors">
                        <Shield size={18} /> Manage Store
                      </button>
                    </Link>
                    <Link href="/admin/quests">
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 font-bold transition-colors">
                        <Shield size={18} /> Manage Quests
                      </button>
                    </Link>
                  </>
                )}

                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item)}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isActive
                        ? "bg-gradient-to-r from-amber-50 to-orange-50 text-[#C9984E] font-bold border-2 border-[#C9984E]/30"
                        : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="text-sm font-semibold">{item.label}</span>
                    </button>
                  );
                })}

                <div className="flex justify-center w-full">
                  {!isSignedIn ? (
                    <div>
                      <>
                        <Link href="/sign-in" className="px-4 py-2 rounded-xl bg-gradient-to-br from-yellow-700 to-yellow-600 text-white mx-1">
                          Sign In
                        </Link>
                        <Link href="/sign-up" className="px-4 py-2 rounded-xl bg-gradient-to-bl from-amber-700 to-amber-600 text-white mx-1">
                          Sign Up
                        </Link>
                      </>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      {currentUser?.profilePic && (
                        <Link href="/profile">
                          <img
                            src={currentUser.profilePic}
                            alt="avatar"
                            className="w-10 h-10 rounded-full object-cover border-2 border-[#C9984E] cursor-pointer hover:scale-105 transition-transform"
                          />
                        </Link>
                      )}
                      <SignOutButton>
                        <button className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700">
                          Logout
                        </button>
                      </SignOutButton>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Search Modal */}
      <SearchUsersModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}