"use client";
import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import Sidebar from "../../../../components/Sidebar";
import { Shield, Check, X, Filter, AlertTriangle, Eye, Clock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "../../../../components/Toast";

type StatusFilter = "all" | "pending" | "resolved" | "dismissed";

export default function AdminReportsPage() {
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const reports = useQuery(api.reports.getReports, filter === "all" ? {} : { status: filter });
  const resolveReport = useMutation(api.reports.resolveReport);
  const toast = useToast();

  const handleResolve = async (reportId: Id<"reports">, action: "approve" | "dismiss") => {
    try {
      await resolveReport({ reportId, action });
      toast.success(action === "approve" ? "Content Hidden" : "Report Dismissed",
        action === "approve" ? "The reported content has been hidden." : "The report has been dismissed.");
    } catch (err) { toast.error("Error", (err as Error).message); }
  };

  const statusColors: Record<string, string> = {
    pending: "text-yellow-600",
    resolved: "text-green-600",
    dismissed: "text-gray-500",
  };

  const filters: { value: StatusFilter; label: string; emoji: string }[] = [
    { value: "pending", label: "Pending", emoji: "⏳" },
    { value: "resolved", label: "Resolved", emoji: "✅" },
    { value: "dismissed", label: "Dismissed", emoji: "❌" },
    { value: "all", label: "All", emoji: "📋" },
  ];

  return (<><Sidebar /><div className="min-h-screen bg-[#e0e5ec] pt-20 lg:pt-10 px-5 pb-10 lg:pl-[300px]">
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff' }}>
            <Shield size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-800">Reports</h1>
            <p className="text-gray-500 text-sm">Review and manage user reports</p>
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === f.value ? "nm-gradient-btn" : "nm-btn text-gray-600"}`}>
            <span className="mr-1">{f.emoji}</span>{f.label}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {reports === undefined ? (
        <div className="text-center py-20"><Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" /><p className="text-gray-400">Loading reports...</p></div>
      ) : reports.length === 0 ? (
        <div className="nm-raised p-12 text-center"><div className="text-5xl mb-4">🎉</div><h3 className="text-xl font-bold text-gray-800 mb-2">No {filter !== "all" ? filter : ""} reports</h3><p className="text-gray-500">All clear!</p></div>
      ) : (
        <div className="space-y-4">
          {reports.map((report, i) => (
            <motion.div key={report._id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.03 }}
              className="nm-raised p-5">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase" style={{ boxShadow: 'inset 2px 2px 4px #a3b1c6, inset -2px -2px 4px #ffffff', background: '#e0e5ec' }}>
                      {report.targetType === "post" ? "📝" : report.targetType === "answer" ? "💬" : "👤"} {report.targetType}
                    </span>
                    <span className={`text-xs font-bold uppercase ${statusColors[report.status]}`}>● {report.status}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12} />{new Date(report.createdAt).toLocaleDateString("th-TH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>

                  {/* Content */}
                  <div className="mb-3 p-3 rounded-xl" style={{ boxShadow: 'inset 2px 2px 5px #a3b1c6, inset -2px -2px 5px #ffffff', background: '#dce1e8' }}>
                    <p className="text-sm font-bold text-gray-800 mb-1">{report.targetContent}</p>
                    {report.targetAuthor && <p className="text-xs text-gray-500">By: {report.targetAuthor}</p>}
                  </div>

                  {/* Reason & Reporter */}
                  <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500">
                    <span className="flex items-center gap-1"><AlertTriangle size={12} className="text-red-400" /><strong>Reason:</strong> {report.reason}</span>
                    <span>•</span>
                    <span><strong>Reporter:</strong> {report.reporterName}</span>
                  </div>
                </div>

                {/* Actions */}
                {report.status === "pending" && (
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <button onClick={() => handleResolve(report._id, "approve")}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
                      style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '3px 3px 6px #a3b1c6, -3px -3px 6px #ffffff' }}>
                      <Check size={16} />Hide
                    </button>
                    <button onClick={() => handleResolve(report._id, "dismiss")}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl nm-btn text-sm font-bold text-gray-600">
                      <X size={16} />Dismiss
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  </div></>);
}
