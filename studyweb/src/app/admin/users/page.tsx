"use client";
import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import Sidebar from "../../../../components/Sidebar";
import { Users, Search, Shield, ShieldOff, Crown, Loader2, Ban, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "../../../../components/Toast";
import Link from "next/link";

const ROLES = ["user", "admin", "developer"];

export default function AdminUsersPage() {
  const allUsers = useQuery(api.users.getAllUsers);
  const banUser = useMutation(api.users.banUser);
  const unbanUser = useMutation(api.users.unbanUser);
  const updateRole = useMutation(api.users.updateUserRole);
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = allUsers?.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role.toLowerCase() === roleFilter;
    return matchSearch && matchRole;
  });

  const handleBan = async (userId: Id<"users">, isBanned: boolean) => {
    try {
      if (isBanned) { await unbanUser({ userId }); toast.success("Unbanned", "User has been unbanned."); }
      else { await banUser({ userId }); toast.success("Banned", "User has been banned."); }
    } catch (err) { toast.error("Error", (err as Error).message); }
  };

  const handleRoleChange = async (userId: Id<"users">, newRole: string) => {
    try {
      await updateRole({ userId, role: newRole });
      toast.success("Role Updated", `User role changed to ${newRole}.`);
    } catch (err) { toast.error("Error", (err as Error).message); }
  };

  return (<><Sidebar /><div className="min-h-screen bg-[#e0e5ec] pt-20 lg:pt-10 px-5 pb-10 lg:pl-[300px]">
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', boxShadow: '4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff' }}>
            <Users size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-800">Users</h1>
            <p className="text-gray-500 text-sm">{allUsers ? `${allUsers.length} total users` : "Loading..."}</p>
          </div>
        </div>
      </motion.div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..."
            className="w-full pl-11 pr-4 py-3 rounded-xl nm-input text-sm" />
        </div>
        <div className="flex gap-2">
          {["all", ...ROLES].map((r) => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${roleFilter === r ? "nm-gradient-btn" : "nm-btn text-gray-600"}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users List */}
      {filtered === undefined ? (
        <div className="text-center py-20"><Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" /><p className="text-gray-400">Loading users...</p></div>
      ) : filtered.length === 0 ? (
        <div className="nm-raised p-12 text-center"><div className="text-5xl mb-4">🔍</div><h3 className="text-xl font-bold text-gray-800 mb-2">No users found</h3></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((user, i) => (
            <motion.div key={user._id} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.02 }}
              className={`nm-raised p-4 ${user.banned ? "ring-2 ring-red-300 opacity-70" : ""}`}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Avatar + Info */}
                <Link href={`/profile/${user._id}`} className="flex items-center gap-3 flex-1 min-w-0 group">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', boxShadow: '3px 3px 6px #a3b1c6, -3px -3px 6px #ffffff' }}>
                    {user.profilePic ? <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                      : <span className="text-white font-bold text-sm">{user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}</span>}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-800 truncate group-hover:text-purple-600 transition-colors">{user.name}</p>
                      {user.banned && <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-600 text-[10px] font-bold">BANNED</span>}
                      {(user.role === "admin" || user.role === "Admin") && <Crown size={14} className="text-yellow-500" />}
                      {(user.role === "developer" || user.role === "Developer") && <Shield size={14} className="text-purple-500" />}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </Link>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500 shrink-0">
                  <span className="flex items-center gap-1">💰 <strong>{user.coins}</strong></span>
                  <span className="flex items-center gap-1">🔥 <strong>{user.answerStreak}</strong></span>
                  <span className="flex items-center gap-1">⭐ <strong>{user.bestStreak}</strong></span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Role Selector */}
                  <select
                    value={user.role.toLowerCase()}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    className="px-3 py-2 rounded-xl nm-input text-xs font-bold text-gray-600 cursor-pointer"
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>

                  {/* Ban/Unban */}
                  <button onClick={() => handleBan(user._id, user.banned)}
                    className={`p-2 rounded-xl nm-btn transition-all ${user.banned ? "text-green-500 hover:text-green-700" : "text-red-400 hover:text-red-600"}`}
                    title={user.banned ? "Unban" : "Ban"}>
                    {user.banned ? <CheckCircle size={18} /> : <Ban size={18} />}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  </div></>);
}
