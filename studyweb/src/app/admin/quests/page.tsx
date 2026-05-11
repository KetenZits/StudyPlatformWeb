"use client";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Plus, Trash2, Shield, Target } from "lucide-react";
import Sidebar from "../../../../components/Sidebar";
import Footer from "../../../../components/Footer";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminQuestsPage() {
  const quests = useQuery(api.dailyQuests.getAllQuests);
  const createQuest = useMutation(api.dailyQuests.createQuest);
  const toggleQuest = useMutation(api.dailyQuests.toggleQuestActive);
  const deleteQuest = useMutation(api.dailyQuests.deleteQuest);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", type: "answer_questions", target: 1, reward: 10, emoji: "📝" });

  const handleCreate = async (e: React.FormEvent) => { e.preventDefault(); await createQuest(formData); setIsAdding(false); setFormData({ title: "", description: "", type: "answer_questions", target: 1, reward: 10, emoji: "📝" }); };

  return (<><Sidebar /><div className="min-h-screen bg-[#e0e5ec] pt-20 lg:pt-12 pb-10 lg:pl-[280px]">
    <div className="max-w-6xl mx-auto px-5 md:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', boxShadow: '4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff' }}><Target size={24} className="text-white" /></div>
            Quest Manager
          </h1>
          <p className="text-gray-500 mt-1 ml-15">Create and manage daily quests</p>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all ${isAdding ? "nm-btn text-gray-600" : "nm-gradient-btn"}`}>
          {isAdding ? "Cancel" : <><Plus size={18} /> New Quest</>}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ opacity: 0, y: -20, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -20, height: 0 }} className="mb-8 overflow-hidden">
            <div className="nm-raised p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Daily Quest</h2>
              <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-gray-600 mb-1">Title</label><input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full nm-input" /></div>
                <div><label className="block text-sm font-bold text-gray-600 mb-1">Emoji</label><input type="text" required value={formData.emoji} onChange={e => setFormData({...formData, emoji: e.target.value})} className="w-full nm-input" /></div>
                <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-600 mb-1">Description</label><input type="text" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full nm-input" /></div>
                <div><label className="block text-sm font-bold text-gray-600 mb-1">Type (System Hook)</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full nm-input">
                    <option value="answer_questions">Answer Questions</option><option value="get_best_answer">Get Best Answer</option><option value="study_time">Study Time (Mins)</option><option value="login_streak">Login Streak</option>
                  </select>
                </div>
                <div><label className="block text-sm font-bold text-gray-600 mb-1">Target Amount</label><input type="number" required min="1" value={formData.target} onChange={e => setFormData({...formData, target: Number(e.target.value)})} className="w-full nm-input" /></div>
                <div><label className="block text-sm font-bold text-gray-600 mb-1">Reward (Coins)</label><input type="number" required min="1" value={formData.reward} onChange={e => setFormData({...formData, reward: Number(e.target.value)})} className="w-full nm-input" /></div>
                <div className="md:col-span-2 flex justify-end mt-4"><button type="submit" className="nm-gradient-btn px-6 py-3" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>Save Quest</button></div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="nm-raised overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead><tr className="border-b border-gray-300/30">
              <th className="p-4 font-bold text-gray-600 text-sm">Quest</th><th className="p-4 font-bold text-gray-600 text-sm">Type Hook</th><th className="p-4 font-bold text-gray-600 text-sm">Target</th><th className="p-4 font-bold text-gray-600 text-sm">Reward</th><th className="p-4 font-bold text-gray-600 text-sm text-center">Status</th><th className="p-4 font-bold text-gray-600 text-sm text-right">Actions</th>
            </tr></thead>
            <tbody>
              {quests === undefined ? <tr><td colSpan={6} className="p-4 text-center text-gray-400">Loading...</td></tr>
              : quests.map((quest) => (
                <tr key={quest._id} className="border-b border-gray-300/20 last:border-0 hover:bg-white/20 transition-colors">
                  <td className="p-4"><div className="font-bold text-gray-800">{quest.emoji} {quest.title}</div><div className="text-xs text-gray-500">{quest.description}</div></td>
                  <td className="p-4"><span className="text-sm font-mono nm-inset-xs px-3 py-1 text-gray-600">{quest.type}</span></td>
                  <td className="p-4 font-bold text-gray-800">{quest.target}</td>
                  <td className="p-4 font-bold text-yellow-600">{quest.reward} 🪙</td>
                  <td className="p-4 text-center">
                    <button onClick={() => toggleQuest({ questId: quest._id, isActive: !quest.isActive })}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${quest.isActive ? "text-white" : "nm-inset-xs text-red-600"}`}
                      style={quest.isActive ? { background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '2px 2px 4px #a3b1c6, -2px -2px 4px #ffffff' } : {}}>
                      {quest.isActive ? "Active" : "Disabled"}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => { if (confirm("Delete this quest?")) deleteQuest({ questId: quest._id }); }} className="p-2 text-red-500 hover:bg-red-100/30 rounded-lg transition-colors"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div><Footer /></>);
}
