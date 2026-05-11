"use client";
import { Ban, LogOut } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import { motion } from "framer-motion";

export default function BannedPage() {
    return (
        <div className="min-h-screen bg-[#e0e5ec] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-md"
            >
                {/* Ban Icon */}
                <motion.div
                    initial={{ rotate: -10 }}
                    animate={{ rotate: 0 }}
                    transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
                    className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8"
                    style={{ 
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      boxShadow: '10px 10px 20px #a3b1c6, -10px -10px 20px #ffffff'
                    }}
                >
                    <Ban size={64} className="text-white" />
                </motion.div>

                {/* Title */}
                <h1 className="text-4xl font-black text-gray-800 mb-4">
                    You got <span className="text-red-500">Banned</span>
                </h1>

                {/* Message */}
                <p className="text-gray-600 text-lg mb-2">
                    Your account has been suspended by an administrator.
                </p>
                <p className="text-gray-500 text-sm mb-8">
                    If you believe this is a mistake, please contact the administrator.
                </p>

                {/* Divider */}
                <div className="w-16 h-1 bg-gradient-to-r from-red-400 to-red-600 rounded-full mx-auto mb-8"></div>

                {/* Logout Button */}
                <SignOutButton>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-bold text-lg transition-colors"
                        style={{ 
                          background: 'linear-gradient(135deg, #374151, #1f2937)',
                          boxShadow: '6px 6px 14px #a3b1c6, -6px -6px 14px #ffffff'
                        }}
                    >
                        <LogOut size={22} />
                        Logout
                    </motion.button>
                </SignOutButton>
            </motion.div>
        </div>
    );
}
