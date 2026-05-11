"use client";
import { motion } from "framer-motion";
import { Send, BookOpen, Tag, Type, AlertCircle, Sparkles, Image as ImageIcon, X, Upload } from "lucide-react";
import React, { useState, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Sidebar from "../../../../components/Sidebar";
import Footer from "../../../../components/Footer";
import { useRouter } from "next/navigation";
import { useToast } from "../../../../components/Toast";
import RichTextEditor from "../../../../components/RichTextEditor";
import MarkdownRenderer from "../../../../components/MarkdownRenderer";

const GRADIENT_COLORS = [
  "from-blue-500 to-cyan-500", "from-purple-500 to-pink-500", "from-green-500 to-emerald-500",
  "from-orange-500 to-red-500", "from-teal-500 to-cyan-500", "from-amber-500 to-yellow-500",
  "from-indigo-500 to-blue-500", "from-pink-500 to-rose-500", "from-violet-500 to-purple-500",
];

export default function CreatePostPage() {
  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);
  const createPost = useMutation(api.posts.createPost);
  const dbCategories = useQuery(api.categories.getCategories);
  const router = useRouter();
  const toast = useToast();
  const [formData, setFormData] = useState({ title: "", body: "", category: "" });
  const [errors, setErrors] = useState({ title: "", body: "", category: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const categories = useMemo(() => {
    if (!dbCategories || dbCategories.length === 0) {
      return [
        { id: "math", label: "Math", emoji: "📐", color: "from-blue-500 to-cyan-500" },
        { id: "science", label: "Science", emoji: "🔬", color: "from-green-500 to-emerald-500" },
        { id: "thai", label: "Thai", emoji: "📖", color: "from-orange-500 to-red-500" },
        { id: "english", label: "English", emoji: "🌍", color: "from-indigo-500 to-blue-500" },
        { id: "social", label: "Social", emoji: "🌏", color: "from-teal-500 to-cyan-500" },
        { id: "computer", label: "Computer", emoji: "💻", color: "from-purple-500 to-pink-500" },
        { id: "art", label: "Art", emoji: "🎨", color: "from-pink-500 to-rose-500" },
        { id: "other", label: "Other", emoji: "📚", color: "from-amber-500 to-yellow-500" },
      ];
    }
    return dbCategories.map((c, i) => {
      const parts = c.name.match(/^(\S+)\s+(.+)$/);
      return { id: c.slug, label: parts ? parts[2] : c.name, emoji: parts ? parts[1] : "📂", color: GRADIENT_COLORS[i % GRADIENT_COLORS.length] };
    });
  }, [dbCategories]);

  const validateForm = () => {
    const newErrors = { title: "", body: "", category: "" };
    let isValid = true;
    if (formData.title.trim().length < 10) { newErrors.title = "Title must be at least 10 characters"; isValid = false; }
    if (formData.body.trim().length < 20) { newErrors.body = "Description must be at least 20 characters"; isValid = false; }
    if (!formData.category) { newErrors.category = "Please select a category"; isValid = false; }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      let imageStorageId;
      if (file) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": file.type }, body: file });
        const { storageId } = await result.json();
        imageStorageId = storageId;
      }
      await createPost({ title: formData.title, body: formData.body, category: formData.category, imageStorageId });
      router.push("/posts");
    } catch (err) { console.error("Error creating post:", err); } finally { setIsSubmitting(false); }
  };

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;
    if (selectedFile.size > 5 * 1024 * 1024) { toast.warning("File Too Large", "Max 5MB"); return; }
    if (!selectedFile.type.startsWith('image/')) { toast.warning("Invalid File", "Please upload an image"); return; }
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const removeImage = () => { setFile(null); setPreviewUrl(null); };

  return (<><Sidebar /><div className="min-h-screen bg-[#e0e5ec] lg:pl-[280px]">
    <div className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 pt-20 md:pt-12 pb-16">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-10">
        <div className="flex items-center gap-3 mb-3"><span className="text-5xl">✍️</span><h1 className="text-4xl sm:text-5xl font-black text-gray-800 tracking-tight">Create <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">Question</span></h1></div>
        <p className="text-gray-500 text-lg font-medium">Ask anything and get help from the community ✨</p>
      </motion.div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="nm-raised p-6 sm:p-8">
        <div className="space-y-8">
          {/* Title */}
          <div>
            <label className="flex items-center gap-2 text-base font-bold text-gray-800 mb-3"><Type size={20} className="text-purple-500" />Question Title</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., How do I solve quadratic equations?" className="w-full px-5 py-4 rounded-xl nm-input" />
            {errors.title && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mt-2 text-red-500 text-sm font-medium"><AlertCircle size={16} />{errors.title}</motion.div>}
            <p className="mt-2 text-sm text-gray-400">Be specific and clear.</p>
          </div>

          {/* Category */}
          <div>
            <label className="flex items-center gap-2 text-base font-bold text-gray-800 mb-3"><Tag size={20} className="text-purple-500" />Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <motion.button key={cat.id} type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setFormData({ ...formData, category: cat.id })}
                  className={`p-4 rounded-2xl transition-all ${formData.category === cat.id ? "nm-gradient-btn" : "nm-btn"}`}>
                  <div className="text-3xl mb-2">{cat.emoji}</div>
                  <div className={`text-sm font-bold ${formData.category === cat.id ? "text-white" : "text-gray-600"}`}>{cat.label}</div>
                </motion.button>
              ))}
            </div>
            {errors.category && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mt-3 text-red-500 text-sm font-medium"><AlertCircle size={16} />{errors.category}</motion.div>}
          </div>

          {/* Body */}
          <div>
            <label className="flex items-center gap-2 text-base font-bold text-gray-800 mb-3"><BookOpen size={20} className="text-purple-500" />Question Details</label>
            <RichTextEditor value={formData.body} onChange={(val) => setFormData({ ...formData, body: val })} placeholder="Provide more context about your question..." />
            {errors.body && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mt-2 text-red-500 text-sm font-medium"><AlertCircle size={16} />{errors.body}</motion.div>}
          </div>

          {/* Image Upload */}
          <div>
            <label className="flex items-center gap-2 text-base font-bold text-gray-800 mb-3"><ImageIcon size={20} className="text-purple-500" />Image (Optional)</label>
            {!previewUrl ? (
              <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }} onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileChange(e.dataTransfer.files[0]); }}
                className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 transition-all ${isDragging ? "border-purple-500" : "border-gray-400/50"}`} style={{ background: '#e0e5ec', boxShadow: isDragging ? 'inset 4px 4px 8px #a3b1c6, inset -4px -4px 8px #ffffff' : '' }}>
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="text-center"><div className="w-16 h-16 mx-auto mb-4 rounded-2xl nm-raised flex items-center justify-center"><Upload size={32} className="text-purple-500" /></div><h3 className="text-lg font-bold text-gray-800 mb-2">{isDragging ? "Drop here" : "Upload an image"}</h3><p className="text-sm text-gray-500">Drag and drop or click to browse</p><p className="text-xs text-gray-400 mt-2">PNG, JPG, GIF up to 5MB</p></div>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative rounded-2xl overflow-hidden nm-raised">
                <button type="button" onClick={removeImage} className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg transition-all hover:scale-110"><X size={20} className="text-white" /></button>
                <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-96 object-contain" />
                <div className="p-4 border-t border-gray-300/40"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg nm-gradient-btn flex items-center justify-center flex-shrink-0"><ImageIcon size={20} /></div><div className="flex-1 min-w-0"><div className="text-sm font-bold text-gray-800 truncate">{file?.name}</div><div className="text-xs text-gray-500">{file && (file.size / 1024).toFixed(2)} KB</div></div></div></div>
              </motion.div>
            )}
          </div>

          {/* Tips */}
          <div className="p-5 rounded-2xl nm-inset">
            <div className="flex items-start gap-3"><Sparkles className="text-purple-500 flex-shrink-0 mt-1" size={20} /><div><h3 className="font-bold text-gray-800 mb-2">Tips for great answers:</h3><ul className="space-y-1 text-sm text-gray-600"><li>• Make your title clear and descriptive</li><li>• Explain what you&apos;ve already tried</li><li>• Include relevant context or examples</li><li>• Choose the most appropriate category</li></ul></div></div>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <motion.button type="button" disabled={isSubmitting} onClick={handleSubmit} whileHover={{ scale: isSubmitting ? 1 : 1.02 }} whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className={`flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold transition-all ${isSubmitting ? "nm-btn text-gray-400 cursor-not-allowed" : "nm-gradient-btn"}`}>
              {isSubmitting ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Posting...</span></> : <><Send size={20} /><span>Post Question</span></>}
            </motion.button>
            <button type="button" onClick={() => { setFormData({ title: "", body: "", category: "" }); setFile(null); setPreviewUrl(null); }} className="px-8 py-4 rounded-xl nm-btn text-gray-600 font-bold transition-all">Cancel</button>
          </div>
        </div>
      </motion.div>

      {/* Preview */}
      {formData.title && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 nm-raised p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Preview</h3>
          <div className="space-y-4">
            <h4 className="text-xl font-bold text-gray-800">{formData.title}</h4>
            {formData.category && <div className="inline-flex"><span className={`px-3 py-1 rounded-lg bg-gradient-to-r ${categories.find(c => c.id === formData.category)?.color} text-white text-sm font-bold`}>{categories.find(c => c.id === formData.category)?.emoji} {categories.find(c => c.id === formData.category)?.label}</span></div>}
            {formData.body && <div className="nm-inset p-4"><MarkdownRenderer content={formData.body} /></div>}
            {previewUrl && <div className="rounded-xl overflow-hidden nm-raised"><img src={previewUrl} alt="Preview" className="w-full h-auto max-h-80 object-contain" /></div>}
          </div>
        </motion.div>
      )}
    </div>
  </div><Footer /></>);
}