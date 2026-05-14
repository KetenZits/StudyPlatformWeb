"use client";
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Flame } from "lucide-react";

// ─────────── Types ───────────
type ToastType = "success" | "error" | "warning" | "info" | "streak";

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextValue {
    toast: {
        success: (title: string, message?: string) => void;
        error: (title: string, message?: string) => void;
        warning: (title: string, message?: string) => void;
        info: (title: string, message?: string) => void;
        streak: (title: string, message?: string) => void;
    };
}

const ToastContext = createContext<ToastContextValue | null>(null);

// ─────────── Hook ───────────
export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within a ToastProvider");
    return ctx.toast;
}

// ─────────── Config ───────────
const TOAST_CONFIG: Record<ToastType, {
    icon: React.ReactNode;
    iconBg: string;
    accentColor: string;
    progressColor: string;
}> = {
    success: {
        icon: <CheckCircle2 size={22} className="text-white" />,
        iconBg: "bg-gradient-to-br from-green-500 to-emerald-600",
        accentColor: "text-green-700",
        progressColor: "bg-green-500",
    },
    error: {
        icon: <XCircle size={22} className="text-white" />,
        iconBg: "bg-gradient-to-br from-red-500 to-rose-600",
        accentColor: "text-red-700",
        progressColor: "bg-red-500",
    },
    warning: {
        icon: <AlertTriangle size={22} className="text-white" />,
        iconBg: "bg-gradient-to-br from-amber-500 to-yellow-600",
        accentColor: "text-amber-700",
        progressColor: "bg-amber-500",
    },
    info: {
        icon: <Info size={22} className="text-white" />,
        iconBg: "bg-gradient-to-br from-blue-500 to-cyan-600",
        accentColor: "text-blue-700",
        progressColor: "bg-blue-500",
    },
    streak: {
        icon: <Flame size={22} className="text-white" />,
        iconBg: "bg-gradient-to-br from-purple-500 to-pink-600",
        accentColor: "text-purple-700",
        progressColor: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
};

// ─────────── Single Toast Component ───────────
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    const config = TOAST_CONFIG[toast.type];
    const duration = toast.duration ?? 4000;
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        timerRef.current = setTimeout(() => onRemove(toast.id), duration);
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [toast.id, duration, onRemove]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative w-[380px] max-w-[90vw] bg-[var(--nm-bg)] rounded-2xl overflow-hidden"
            style={{ boxShadow: '8px 8px 16px var(--nm-shadow-dark), -8px -8px 16px var(--nm-shadow-light)' }}
        >
            <div className="flex items-start gap-3 p-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl ${config.iconBg} flex items-center justify-center shadow-md shrink-0`}>
                    {config.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm font-bold text-gray-800 leading-tight">{toast.title}</p>
                    {toast.message && (
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{toast.message}</p>
                    )}
                </div>

                {/* Close */}
                <button
                    onClick={() => onRemove(toast.id)}
                    className="p-1 rounded-lg hover:bg-black/5 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                >
                    <X size={14} />
                </button>
            </div>

            {/* Progress bar */}
            <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: duration / 1000, ease: "linear" }}
                className={`h-0.5 ${config.progressColor}`}
            />
        </motion.div>
    );
}

// ─────────── Provider ───────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback((type: ToastType, title: string, message?: string) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setToasts((prev) => [...prev.slice(-4), { id, type, title, message }]); // max 5
    }, []);

    const toast = {
        success: (title: string, message?: string) => addToast("success", title, message),
        error: (title: string, message?: string) => addToast("error", title, message),
        warning: (title: string, message?: string) => addToast("warning", title, message),
        info: (title: string, message?: string) => addToast("info", title, message),
        streak: (title: string, message?: string) => addToast("streak", title, message),
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence mode="popLayout">
                    {toasts.map((t) => (
                        <div key={t.id} className="pointer-events-auto">
                            <ToastItem toast={t} onRemove={removeToast} />
                        </div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}
