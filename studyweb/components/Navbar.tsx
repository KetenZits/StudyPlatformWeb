"use client";
import { Home, BookOpen, LogIn, Store, User, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {

  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Home", icon: Home, link: "/" },
    { id: "posts", label: "Posts", icon: BookOpen, link: "/posts" },
    { id: "login", label: "Login", icon: LogIn, link: "/login" },
    { id: "store", label: "Store", icon: Store, link: "/store" },
    { id: "profile", label: "Profile", icon: User, link: "/profile" },
  ];

    useEffect(() => {
    if (pathname === "/") setActiveTab("home");
    else if (pathname.startsWith("/posts")) setActiveTab("posts");
    else if (pathname.startsWith("/store")) setActiveTab("store");
    else if (pathname.startsWith("/login")) setActiveTab("login");
    else if (pathname.startsWith("/profile")) setActiveTab("profile");
  }, [pathname]);

  return (
    <>
      {/* Desktop Navbar - Top */}
      <nav className="hidden lg:block fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4A574] to-[#B8873D] flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-xl">S</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-gray-900">Study Platform</span>
                <span className="text-xs text-gray-500 font-medium">Learn & Share Knowledge</span>
              </div>
            </motion.div>

            {/* Desktop Nav Items */}
            <div className="flex items-center gap-2">
              {navItems.map((item, i) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <Link key={item.id} href={item.link}>
                    <motion.button
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setActiveTab(item.id)}
                      className={`relative flex items-center gap-3 px-6 py-3 rounded-xl transition-all ${
                        isActive 
                          ? "text-[#C9984E] font-bold" 
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="text-sm font-semibold">{item.label}</span>
                      
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl -z-10 border-2 border-[#C9984E]/30"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </motion.button>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar - Top (with hamburger) */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-lg">
        <div className="flex items-center justify-between h-16 px-5">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4A574] to-[#B8873D] flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-lg">S</span>
            </div>
            <span className="text-lg font-black text-gray-900">Study</span>
          </div>

          {/* Hamburger Menu */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden bg-white border-t border-gray-100"
            >
              <div className="px-5 py-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-amber-50 to-orange-50 text-[#C9984E] font-bold border-2 border-[#C9984E]/30"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="text-sm font-semibold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

    </>
  );
}