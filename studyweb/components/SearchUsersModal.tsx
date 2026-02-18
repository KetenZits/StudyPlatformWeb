"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, User2, Loader2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import Link from "next/link";

interface SearchUsersModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchUsersModal({ isOpen, onClose }: SearchUsersModalProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const results = useQuery(
        api.achievements.searchUsers,
        searchTerm.trim().length > 0 ? { searchTerm: searchTerm.trim() } : "skip"
    );

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setSearchTerm("");
        }
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: -30, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-lg z-[101]"
                    >
                        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mx-4">

                            {/* Search Input */}
                            <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
                                <Search size={22} className="text-gray-400 shrink-0" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search people by name or email..."
                                    className="flex-1 text-lg text-gray-900 placeholder-gray-400 outline-none bg-transparent"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>

                            {/* Results */}
                            <div className="max-h-80 overflow-y-auto">
                                {searchTerm.trim().length === 0 ? (
                                    <div className="py-12 text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                                            <Search size={28} className="text-orange-400" />
                                        </div>
                                        <p className="text-gray-500 font-medium">Start typing to find people</p>
                                        <p className="text-gray-400 text-sm mt-1">Search by name or email</p>
                                    </div>
                                ) : results === undefined ? (
                                    <div className="py-12 text-center">
                                        <Loader2 size={28} className="text-orange-500 animate-spin mx-auto mb-3" />
                                        <p className="text-gray-500 font-medium">Searching...</p>
                                    </div>
                                ) : results.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <div className="text-4xl mb-3">😕</div>
                                        <p className="text-gray-500 font-medium">No users found</p>
                                        <p className="text-gray-400 text-sm mt-1">Try a different search term</p>
                                    </div>
                                ) : (
                                    <div className="py-2">
                                        {results.map((user, i) => (
                                            <Link
                                                key={user._id}
                                                href={`/profile/${user._id}`}
                                                onClick={onClose}
                                            >
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.03 }}
                                                    className="flex items-center gap-4 px-6 py-3.5 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all cursor-pointer group"
                                                >
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4A574] via-[#C9984E] to-[#B8873D] flex items-center justify-center shadow-md overflow-hidden shrink-0">
                                                        {user.profilePic ? (
                                                            <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-white font-bold text-sm">
                                                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-gray-900 group-hover:text-amber-700 transition-colors truncate">
                                                            {user.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                    </div>
                                                    <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold">
                                                            View
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer hint */}
                            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                                <p className="text-xs text-gray-400 text-center">
                                    Press <kbd className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 font-mono text-[10px]">Esc</kbd> to close
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
