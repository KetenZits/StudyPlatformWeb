"use client";
import { Ban, LogOut } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import { motion } from "framer-motion";

export default function BannedPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-gray-100 to-red-50 flex items-center justify-center p-4">
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
                    className="w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mx-auto mb-8 shadow-2xl"
                >
                    <Ban size={64} className="text-white" />
                </motion.div>

                {/* Title */}
                <h1 className="text-4xl font-black text-gray-900 mb-4">
                    You got <span className="text-red-600">Banned</span>
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
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gray-900 text-white font-bold text-lg shadow-xl hover:bg-gray-800 transition-colors"
                    >
                        <LogOut size={22} />
                        Logout
                    </motion.button>
                </SignOutButton>
            </motion.div>
        </div>
    );
}
