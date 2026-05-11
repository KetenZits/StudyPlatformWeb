"use client";
import { motion } from "framer-motion";
import { Save, X, User, FileText, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import Sidebar from "../../../../components/Sidebar";
import Footer from "../../../../components/Footer";
import ProfilePicEditor from "../../../../components/ProfilePicEditor";

export default function EditProfilePage() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const updateProfile = useMutation(api.users.updateProfile);
  const updateProfilePic = useMutation(api.users.updateProfilePic);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUser?.profilePic || null);

  useEffect(() => { if (currentUser) { setName(currentUser.name || ""); setBio(currentUser.bio || ""); setPreviewUrl(currentUser.profilePic || null); } }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setStatus({ type: "", message: "" });
    try { await updateProfile({ name, bio }); setStatus({ type: "success", message: "Profile updated successfully!" }); setTimeout(() => { window.location.href = "/profile"; }, 1500); }
    catch (err) { console.error(err); setStatus({ type: "error", message: "Failed to update profile" }); }
    finally { setIsSubmitting(false); }
  };

  if (!currentUser) return (<div className="min-h-screen bg-[#e0e5ec] flex items-center justify-center"><div className="text-center"><Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" /><h2 className="text-2xl font-bold text-gray-800 mb-2">Loading...</h2></div></div>);

  return (<><Sidebar /><div className="min-h-screen bg-[#e0e5ec] lg:pl-[280px]">
    <div className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 pt-20 md:pt-12 pb-16">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div><h1 className="text-5xl font-black text-gray-800 mb-2">Edit <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">Profile</span></h1><p className="text-gray-500 text-base">Update your personal information</p></div>
          <button onClick={() => window.history.back()} className="w-10 h-10 rounded-xl nm-btn flex items-center justify-center"><X size={20} className="text-gray-600" /></button>
        </div>
      </motion.div>

      {status.message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mb-6 p-4 rounded-2xl ${status.type === "success" ? "nm-raised text-green-700" : "nm-raised text-red-700"}`}><p className="text-sm font-semibold">{status.message}</p></motion.div>
      )}

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="nm-raised p-6 sm:p-8">
        <div className="mb-8 pb-8 border-b border-gray-300/40">
          <label className="flex items-center gap-2 text-base font-bold text-gray-800 mb-4"><span className="text-2xl">📷</span>Profile Picture</label>
          <div className="flex flex-col items-center gap-6">
            <ProfilePicEditor currentImage={previewUrl || undefined} onImageSelect={(tempUrl) => setPreviewUrl(tempUrl)}
              onSave={async (finalUrl, storageId) => { setPreviewUrl(finalUrl); await updateProfilePic({ storageId: storageId as Id<"_storage"> }); setStatus({ type: "success", message: "Profile picture updated!" }); }} />
            <div className="flex-1 text-center sm:text-left"><p className="text-sm text-gray-500">JPG, PNG or GIF. Max size 5MB</p></div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-base font-bold text-gray-800 mb-3"><User size={20} className="text-purple-500" />Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" className="w-full px-5 py-4 rounded-xl nm-input" />
          </div>
          <div>
            <label className="flex items-center gap-2 text-base font-bold text-gray-800 mb-3"><FileText size={20} className="text-purple-500" />Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." rows={6} className="w-full px-5 py-4 rounded-xl nm-input resize-none" />
            <p className="text-sm text-gray-400 mt-2">Write a short bio to let others know more about you</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-gray-300/40">
          <motion.button type="button" disabled={isSubmitting} onClick={handleSubmit} whileHover={{ scale: isSubmitting ? 1 : 1.02 }} whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            className={`flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold transition-all ${isSubmitting ? "nm-btn text-gray-400 cursor-not-allowed" : "nm-gradient-btn"}`}>
            {isSubmitting ? <><Loader2 size={20} className="animate-spin" /><span>Saving...</span></> : <><Save size={20} /><span>Save Changes</span></>}
          </motion.button>
          <button type="button" onClick={() => window.history.back()} disabled={isSubmitting} className="px-8 py-4 rounded-xl nm-btn text-gray-600 font-bold transition-all disabled:opacity-50">Cancel</button>
        </div>
      </motion.div>
    </div>
  </div><Footer /></>);
}