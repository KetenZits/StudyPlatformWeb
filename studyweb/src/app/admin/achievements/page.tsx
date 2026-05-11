"use client";
import React, { useState, useRef } from "react";
import Sidebar from "../../../../components/Sidebar";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Trophy, Plus, Pencil, Trash2, UserPlus, X, Search, Award, Clock, ChevronDown, ChevronUp, ImagePlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useToast } from "../../../../components/Toast";

type Achievement = { _id: Id<"achievements">; name: string; description: string; condition: string; imageStorageId?: Id<"_storage">; imageUrl?: string | null; createdAt: number; };

export default function AchievementsAdminPage() {
  const achievements = useQuery(api.achievements.getAllAchievements);
  const createAchievement = useMutation(api.achievements.createAchievement);
  const updateAchievement = useMutation(api.achievements.updateAchievement);
  const deleteAchievement = useMutation(api.achievements.deleteAchievement);
  const generateUploadUrl = useMutation(api.achievements.generateUploadUrl);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<Id<"achievements"> | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", condition: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [assignAchievementId, setAssignAchievementId] = useState<Id<"achievements"> | null>(null);
  const [expandedId, setExpandedId] = useState<Id<"achievements"> | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<Id<"achievements"> | null>(null);
  const toast = useToast();

  const openCreateForm = () => { setEditingId(null); setFormData({ name: "", description: "", condition: "" }); setImageFile(null); setImagePreview(null); setExistingImageUrl(null); setShowForm(true); };
  const openEditForm = (a: Achievement) => { setEditingId(a._id); setFormData({ name: a.name, description: a.description, condition: a.condition }); setImageFile(null); setImagePreview(null); setExistingImageUrl(a.imageUrl || null); setShowForm(true); };
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { setImageFile(file); const reader = new FileReader(); reader.onload = () => setImagePreview(reader.result as string); reader.readAsDataURL(file); } };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return; setUploading(true);
    try {
      let imageStorageId: Id<"_storage"> | undefined = undefined;
      if (imageFile) { const uploadUrl = await generateUploadUrl(); const res = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": imageFile.type }, body: imageFile }); const { storageId } = await res.json(); imageStorageId = storageId; }
      if (editingId) { await updateAchievement({ id: editingId, ...formData, ...(imageStorageId && { imageStorageId }) }); }
      else { await createAchievement({ ...formData, ...(imageStorageId && { imageStorageId }) }); }
      setShowForm(false); setFormData({ name: "", description: "", condition: "" }); setImageFile(null); setImagePreview(null); setExistingImageUrl(null); setEditingId(null);
    } catch (err: any) { toast.error("เกิดข้อผิดพลาด", err.message || "ไม่สามารถบันทึกได้"); } finally { setUploading(false); }
  };

  const handleDelete = async (id: Id<"achievements">) => { try { await deleteAchievement({ id }); setDeleteConfirmId(null); } catch (err: any) { toast.error("ลบไม่สำเร็จ", err.message); } };

  return (<><Sidebar /><div className="min-h-screen bg-[#e0e5ec] pt-20 lg:pt-12 px-5 pb-10 lg:pl-[280px]">
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-800 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', boxShadow: '4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff' }}><Trophy size={24} className="text-white" /></div>
            Achievement Manager
          </h1>
          <p className="text-gray-500 mt-2">จัดการ Achievement ทั้งหมดในระบบ</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={openCreateForm} className="flex items-center gap-2 px-6 py-3 nm-gradient-btn"><Plus size={20} />เพิ่ม Achievement</motion.button>
      </div>

      {achievements === undefined ? <div className="text-center py-20 text-gray-400 text-lg">Loading...</div>
      : achievements.length === 0 ? <div className="text-center py-20"><Trophy className="mx-auto text-gray-300 mb-4" size={64} /><p className="text-gray-400 text-lg">ยังไม่มี Achievement</p></div>
      : <div className="space-y-4">{achievements.map((a) => (
        <AchievementCard key={a._id} achievement={a} isExpanded={expandedId === a._id} onToggleExpand={() => setExpandedId(expandedId === a._id ? null : a._id)} onEdit={() => openEditForm(a)} onDelete={() => setDeleteConfirmId(a._id)} onAssign={() => setAssignAchievementId(a._id)} />
      ))}</div>}
    </div>
  </div>

  <AnimatePresence>{showForm && (
    <ModalOverlay onClose={() => setShowForm(false)}>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{editingId ? "แก้ไข Achievement" : "เพิ่ม Achievement ใหม่"}</h2>
      <div className="space-y-4">
        <div><label className="block text-sm font-semibold text-gray-600 mb-2">รูปภาพ Achievement</label>
          <div className="flex items-center gap-4">
            <div onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-400/50 nm-inset cursor-pointer flex items-center justify-center overflow-hidden hover:border-purple-400 transition-colors">
              {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> : existingImageUrl ? <img src={existingImageUrl} alt="Current" className="w-full h-full object-cover" /> : <ImagePlus className="text-gray-400" size={28} />}
            </div>
            <div><p className="text-sm text-gray-500">คลิกเพื่ออัปโหลดรูปภาพ</p><p className="text-xs text-gray-400 mt-1">แนะนำขนาด 200x200 px</p>
              {(imageFile || existingImageUrl) && <button onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); setExistingImageUrl(null); }} className="text-xs text-red-500 hover:text-red-700 mt-1 font-semibold">ลบรูป</button>}
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
        </div>
        <div><label className="block text-sm font-semibold text-gray-600 mb-1">ชื่อ</label><input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full nm-input" placeholder="เช่น First Blood, Top Contributor" /></div>
        <div><label className="block text-sm font-semibold text-gray-600 mb-1">เงื่อนไข</label><input value={formData.condition} onChange={(e) => setFormData({ ...formData, condition: e.target.value })} className="w-full nm-input" placeholder="เช่น ตอบคำถาม 100 ข้อ" /></div>
        <div><label className="block text-sm font-semibold text-gray-600 mb-1">คำอธิบาย</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full nm-input resize-none" placeholder="รายละเอียดเพิ่มเติม..." /></div>
      </div>
      <div className="flex items-center gap-3 mt-6"><button onClick={() => setShowForm(false)} className="flex-1 px-4 py-3 rounded-xl nm-btn text-gray-600 font-semibold">ยกเลิก</button><button onClick={handleSubmit} disabled={uploading} className="flex-1 px-4 py-3 rounded-xl nm-gradient-btn disabled:opacity-50">{uploading ? "กำลังอัปโหลด..." : editingId ? "บันทึก" : "เพิ่ม"}</button></div>
    </ModalOverlay>
  )}</AnimatePresence>

  <AnimatePresence>{deleteConfirmId && (
    <ModalOverlay onClose={() => setDeleteConfirmId(null)}>
      <div className="text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff' }}><Trash2 className="text-white" size={28} /></div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">ยืนยันการลบ</h2><p className="text-gray-500 mb-6">Achievement นี้และข้อมูลที่เกี่ยวข้องจะถูกลบทั้งหมด</p>
        <div className="flex items-center gap-3"><button onClick={() => setDeleteConfirmId(null)} className="flex-1 px-4 py-3 rounded-xl nm-btn text-gray-600 font-semibold">ยกเลิก</button><button onClick={() => handleDelete(deleteConfirmId)} className="flex-1 px-4 py-3 rounded-xl text-white font-bold" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff' }}>ลบ</button></div>
      </div>
    </ModalOverlay>
  )}</AnimatePresence>

  <AnimatePresence>{assignAchievementId && <AssignModal achievementId={assignAchievementId} onClose={() => setAssignAchievementId(null)} />}</AnimatePresence>
  </>);
}

function AchievementCard({ achievement, isExpanded, onToggleExpand, onEdit, onDelete, onAssign }: { achievement: Achievement; isExpanded: boolean; onToggleExpand: () => void; onEdit: () => void; onDelete: () => void; onAssign: () => void; }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="nm-raised overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', boxShadow: '3px 3px 6px #a3b1c6, -3px -3px 6px #ffffff' }}>
              {achievement.imageUrl ? <img src={achievement.imageUrl} alt={achievement.name} className="w-full h-full object-cover" /> : <Trophy className="text-white" size={24} />}
            </div>
            <div className="min-w-0"><h3 className="text-lg font-bold text-gray-800">{achievement.name}</h3><p className="text-sm text-gray-500 mt-1">{achievement.description}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold nm-inset-xs text-purple-600 px-3 py-1"><Award size={12} /> {achievement.condition}</span>
                <span className="inline-flex items-center gap-1 text-xs text-gray-400"><Clock size={12} /> {new Date(achievement.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {[{ fn: onAssign, icon: UserPlus, color: "text-green-600" },{ fn: onEdit, icon: Pencil, color: "text-blue-600" },{ fn: onDelete, icon: Trash2, color: "text-red-600" },{ fn: onToggleExpand, icon: isExpanded ? ChevronUp : ChevronDown, color: "text-gray-600" }].map((btn, i) => {
              const Icon = btn.icon;
              return <motion.button key={i} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={btn.fn} className={`p-2.5 rounded-xl nm-btn ${btn.color} transition-colors`}><Icon size={18} /></motion.button>;
            })}
          </div>
        </div>
      </div>
      <AnimatePresence>{isExpanded && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><AchievementUsersPanel achievementId={achievement._id} /></motion.div>}</AnimatePresence>
    </motion.div>
  );
}

function AchievementUsersPanel({ achievementId }: { achievementId: Id<"achievements"> }) {
  const users = useQuery(api.achievements.getAchievementUsers, { achievementId });
  const revokeAchievement = useMutation(api.achievements.revokeAchievement);
  const toast = useToast();
  const handleRevoke = async (userAchievementId: Id<"userAchievements">) => { try { await revokeAchievement({ userAchievementId }); } catch (err: any) { toast.error("ยกเลิกไม่สำเร็จ", err.message); } };

  return (
    <div className="border-t border-gray-300/30 px-6 py-4" style={{ background: 'rgba(224,229,236,0.5)' }}>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">ผู้ใช้ที่ได้รับ ({users?.length ?? 0})</p>
      {users === undefined ? <p className="text-sm text-gray-400">Loading...</p>
      : users.length === 0 ? <p className="text-sm text-gray-400">ยังไม่มีผู้ใช้ที่ได้รับ Achievement นี้</p>
      : <div className="space-y-2">{users.map((ua) => (
        <div key={ua._id} className="flex items-center justify-between nm-flat px-4 py-2">
          <div className="flex items-center gap-3">
            {ua.user?.profilePic ? <img src={ua.user.profilePic} alt="" className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>{ua.user?.name?.[0] ?? "?"}</div>}
            <div><p className="text-sm font-semibold text-gray-800">{ua.user?.name}</p><p className="text-xs text-gray-400">{ua.user?.email}</p></div>
          </div>
          <div className="flex items-center gap-3"><span className="text-xs text-gray-400">{new Date(ua.awardedAt).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}</span><button onClick={() => handleRevoke(ua._id)} className="text-xs text-red-500 hover:text-red-700 font-semibold">ยกเลิก</button></div>
        </div>
      ))}</div>}
    </div>
  );
}

function AssignModal({ achievementId, onClose }: { achievementId: Id<"achievements">; onClose: () => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const searchResults = useQuery(api.achievements.searchUsers, { searchTerm: searchTerm.trim() });
  const awardAchievement = useMutation(api.achievements.awardAchievement);
  const [awarding, setAwarding] = useState(false);
  const toast = useToast();
  const handleAward = async (userId: Id<"users">) => { setAwarding(true); try { await awardAchievement({ userId, achievementId }); toast.success("มอบสำเร็จ! 🎉", "Achievement ได้ถูกมอบให้ผู้ใช้แล้ว"); } catch (err: any) { toast.error("มอบไม่สำเร็จ", err.message); } finally { setAwarding(false); } };

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2"><UserPlus className="text-green-600" size={22} />มอบ Achievement ให้ User</h2>
      <p className="text-sm text-gray-500 mb-5">ค้นหาชื่อหรืออีเมลของผู้ใช้</p>
      <div className="relative mb-4"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 nm-input" placeholder="พิมพ์ชื่อหรืออีเมล..." autoFocus /></div>
      <div className="max-h-64 overflow-y-auto space-y-2">
        {searchTerm.trim().length === 0 ? <p className="text-sm text-gray-400 text-center py-4">พิมพ์เพื่อค้นหาผู้ใช้</p>
        : searchResults === undefined ? <p className="text-sm text-gray-400 text-center py-4">กำลังค้นหา...</p>
        : searchResults.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">ไม่พบผู้ใช้</p>
        : searchResults.map((user) => (
          <div key={user._id} className="flex items-center justify-between nm-flat px-4 py-3">
            <div className="flex items-center gap-3">
              {user.profilePic ? <img src={user.profilePic} alt="" className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>{user.name[0]}</div>}
              <div><p className="text-sm font-semibold text-gray-800">{user.name}</p><p className="text-xs text-gray-400">{user.email}</p></div>
            </div>
            <button onClick={() => handleAward(user._id)} disabled={awarding} className="px-4 py-2 rounded-xl text-white text-sm font-bold disabled:opacity-50 transition-all" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '3px 3px 6px #a3b1c6, -3px -3px 6px #ffffff' }}>มอบ</button>
          </div>
        ))}
      </div>
      <button onClick={onClose} className="w-full mt-5 px-4 py-3 rounded-xl nm-btn text-gray-600 font-semibold">ปิด</button>
    </ModalOverlay>
  );
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()}
        className="nm-raised p-8 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg nm-btn text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
        {children}
      </motion.div>
    </motion.div>
  );
}
