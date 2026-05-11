"use client";
import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import Sidebar from "../../../../components/Sidebar";
import { Tags, Plus, Trash2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "../../../../components/Toast";

export default function AdminCategoriesPage() {
  const categories = useQuery(api.categories.getCategories);
  const createCategory = useMutation(api.categories.createCategory);
  const deleteCategory = useMutation(api.categories.deleteCategory);
  const seedCategories = useMutation(api.categories.seedCategories);
  const toast = useToast();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim() || !slug.trim()) return;
    try {
      await createCategory({ name: name.trim(), slug: slug.trim().toLowerCase() });
      toast.success("Created!", `Category "${name}" added.`);
      setName(""); setSlug("");
    } catch (err) { toast.error("Error", (err as Error).message); }
  };

  const handleDelete = async (id: Id<"categories">) => {
    setDeleting(id);
    try {
      await deleteCategory({ categoryId: id });
      toast.success("Deleted", "Category removed.");
    } catch (err) { toast.error("Error", (err as Error).message); }
    setDeleting(null);
  };

  const handleSeed = async () => {
    try {
      await seedCategories();
      toast.success("Seeded!", "Default categories created.");
    } catch (err) { toast.error("Error", (err as Error).message); }
  };

  return (<><Sidebar /><div className="min-h-screen bg-[#e0e5ec] pt-20 lg:pt-10 px-5 pb-10 lg:pl-[300px]">
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', boxShadow: '4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff' }}>
            <Tags size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-800">Categories</h1>
            <p className="text-gray-500 text-sm">Manage post categories</p>
          </div>
        </div>
      </motion.div>

      {/* Create Form */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="nm-raised p-6 mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Plus size={20} />Add Category</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Display Name (e.g. 📐 Math)" className="flex-1 nm-input px-4 py-3 rounded-xl text-sm" />
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug (e.g. math)" className="flex-1 nm-input px-4 py-3 rounded-xl text-sm" />
          <button onClick={handleCreate} disabled={!name.trim() || !slug.trim()}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${!name.trim() || !slug.trim() ? "nm-btn text-gray-400 cursor-not-allowed" : "nm-gradient-btn"}`}>
            Add
          </button>
        </div>
      </motion.div>

      {/* Category List */}
      {categories === undefined ? (
        <div className="text-center py-20"><Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" /><p className="text-gray-400">Loading...</p></div>
      ) : categories.length === 0 ? (
        <div className="nm-raised p-12 text-center">
          <div className="text-5xl mb-4">📂</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No categories yet</h3>
          <p className="text-gray-500 mb-6">Seed the default categories to get started.</p>
          <button onClick={handleSeed} className="nm-gradient-btn px-6 py-3 rounded-xl font-bold">🌱 Seed Defaults</button>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat, i) => (
            <motion.div key={cat._id} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.03 }}
              className="nm-raised p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-gray-800">{cat.name}</span>
                <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold text-purple-600" style={{ boxShadow: 'inset 2px 2px 4px #a3b1c6, inset -2px -2px 4px #ffffff', background: '#e0e5ec' }}>{cat.slug}</span>
              </div>
              <button onClick={() => handleDelete(cat._id)} disabled={deleting === cat._id}
                className="p-2 rounded-lg nm-btn text-red-400 hover:text-red-600 transition-colors">
                {deleting === cat._id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  </div></>);
}
