"use client";
import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { Flag, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "./Toast";

const REASONS = [
  "Spam or misleading",
  "Inappropriate content",
  "Harassment or bullying",
  "Copyright violation",
  "Off-topic",
  "Other",
];

interface ReportButtonProps {
  targetType: "post" | "answer" | "user";
  targetId: Id<"posts"> | Id<"answers"> | Id<"users">;
  size?: number;
}

export default function ReportButton({ targetType, targetId, size = 16 }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const createReport = useMutation(api.reports.createReport);
  const toast = useToast();

  const handleSubmit = async () => {
    if (!reason) return;
    setSubmitting(true);
    try {
      await createReport({ targetType, targetId: targetId as any, reason });
      toast.success("Reported", "Thank you for your report. We'll review it soon.");
      setOpen(false);
      setReason("");
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes("already reported")) {
        toast.warning("Already Reported", "You have already reported this content.");
      } else {
        toast.error("Error", "Failed to submit report.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50/50 transition-all text-sm font-medium"
        title="Report"
      >
        <Flag size={size} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md nm-raised p-6"
              style={{ background: "var(--nm-bg)" }}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '3px 3px 6px var(--nm-shadow-dark), -3px -3px 6px var(--nm-shadow-light)' }}>
                    <AlertTriangle size={20} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Report {targetType}</h3>
                </div>
                <button onClick={() => setOpen(false)} className="p-2 rounded-lg nm-btn text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>

              <p className="text-sm text-gray-500 mb-4">Select a reason for your report:</p>

              <div className="space-y-2 mb-6">
                {REASONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setReason(r)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${reason === r
                      ? "text-red-600"
                      : "nm-flat text-gray-600 hover:text-gray-800"
                      }`}
                    style={reason === r ? { boxShadow: 'inset 3px 3px 6px var(--nm-shadow-dark), inset -3px -3px 6px var(--nm-shadow-light)', background: 'var(--nm-bg)' } : {}}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setOpen(false)} className="flex-1 px-4 py-3 rounded-xl nm-btn text-gray-600 font-bold">Cancel</button>
                <button
                  onClick={handleSubmit}
                  disabled={!reason || submitting}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all ${!reason || submitting ? "nm-btn text-gray-400 cursor-not-allowed" : "text-white"}`}
                  style={reason && !submitting ? { background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '4px 4px 8px var(--nm-shadow-dark), -4px -4px 8px var(--nm-shadow-light)' } : {}}
                >
                  {submitting ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
