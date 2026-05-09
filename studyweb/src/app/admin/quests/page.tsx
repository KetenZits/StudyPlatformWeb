"use client";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Plus, Edit2, Trash2, Shield, Settings } from "lucide-react";
import Sidebar from "../../../../components/Sidebar";
import Footer from "../../../../components/Footer";

export default function AdminQuestsPage() {
  const quests = useQuery(api.dailyQuests.getAllQuests);
  const createQuest = useMutation(api.dailyQuests.createQuest);
  const toggleQuest = useMutation(api.dailyQuests.toggleQuestActive);
  const deleteQuest = useMutation(api.dailyQuests.deleteQuest);

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "answer_questions",
    target: 1,
    reward: 10,
    emoji: "📝",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createQuest(formData);
    setIsAdding(false);
    setFormData({ title: "", description: "", type: "answer_questions", target: 1, reward: 10, emoji: "📝" });
  };

  return (
    <>
      <Sidebar />
      <div className="min-h-screen bg-gray-50 pt-20 lg:pt-12 pb-10 lg:pl-[280px]">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <Shield className="text-red-500" /> Admin: Quests Manager
            </h1>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl font-bold"
            >
              {isAdding ? "Cancel" : <><Plus size={18} /> New Quest</>}
            </button>
          </div>

          {isAdding && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
              <h2 className="text-xl font-bold mb-4">Create New Daily Quest</h2>
              <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Emoji</label>
                  <input type="text" required value={formData.emoji} onChange={e => setFormData({...formData, emoji: e.target.value})} className="w-full border rounded-lg p-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                  <input type="text" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Type (System Hook)</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border rounded-lg p-2 bg-white">
                    <option value="answer_questions">Answer Questions</option>
                    <option value="get_best_answer">Get Best Answer</option>
                    <option value="study_time">Study Time (Mins)</option>
                    <option value="login_streak">Login Streak</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Target Amount</label>
                  <input type="number" required min="1" value={formData.target} onChange={e => setFormData({...formData, target: Number(e.target.value)})} className="w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Reward (Coins)</label>
                  <input type="number" required min="1" value={formData.reward} onChange={e => setFormData({...formData, reward: Number(e.target.value)})} className="w-full border rounded-lg p-2" />
                </div>
                <div className="md:col-span-2 flex justify-end mt-4">
                  <button type="submit" className="bg-green-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-600 transition-colors">
                    Save Quest
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 font-bold text-gray-700">Quest</th>
                  <th className="p-4 font-bold text-gray-700">Type Hook</th>
                  <th className="p-4 font-bold text-gray-700">Target</th>
                  <th className="p-4 font-bold text-gray-700">Reward</th>
                  <th className="p-4 font-bold text-gray-700 text-center">Status</th>
                  <th className="p-4 font-bold text-gray-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quests === undefined ? (
                  <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
                ) : quests.map((quest) => (
                  <tr key={quest._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{quest.emoji} {quest.title}</div>
                      <div className="text-xs text-gray-500">{quest.description}</div>
                    </td>
                    <td className="p-4 text-sm font-mono text-gray-600 bg-gray-100/50">{quest.type}</td>
                    <td className="p-4 font-bold">{quest.target}</td>
                    <td className="p-4 font-bold text-yellow-600">{quest.reward} 🪙</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleQuest({ questId: quest._id, isActive: !quest.isActive })}
                        className={`px-3 py-1 rounded-full text-xs font-bold ${quest.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {quest.isActive ? "Active" : "Disabled"}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => {
                          if (confirm("Delete this quest?")) {
                            deleteQuest({ questId: quest._id });
                          }
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}
