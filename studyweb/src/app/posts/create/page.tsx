"use client";
import { motion } from "framer-motion";
import { Send, BookOpen, Tag, Type, AlertCircle, Sparkles, Image as ImageIcon, X, Upload } from "lucide-react";
import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useRouter } from "next/navigation";

const categories = [
  { id: "math", label: "Mathematics", emoji: "📐", color: "from-blue-500 to-cyan-500" },
  { id: "programming", label: "Programming", emoji: "💻", color: "from-purple-500 to-pink-500" },
  { id: "biology", label: "Biology", emoji: "🧬", color: "from-green-500 to-emerald-500" },
  { id: "physics", label: "Physics", emoji: "⚛️", color: "from-orange-500 to-red-500" },
  { id: "chemistry", label: "Chemistry", emoji: "🧪", color: "from-teal-500 to-cyan-500" },
  { id: "history", label: "History", emoji: "📚", color: "from-amber-500 to-yellow-500" },
  { id: "english", label: "English", emoji: "📖", color: "from-indigo-500 to-blue-500" },
  { id: "other", label: "Other", emoji: "🌟", color: "from-pink-500 to-rose-500" },
];

export default function CreatePostPage() {

  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);
  const createPost = useMutation(api.posts.createPost);
  const { user } = useUser();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    body: "",
    category: "",
  });
  const [errors, setErrors] = useState({
    title: "",
    body: "",
    category: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Validate form
  const validateForm = () => {
    const newErrors = {
      title: "",
      body: "",
      category: "",
    };
    let isValid = true;

    if (formData.title.trim().length < 10) {
      newErrors.title = "Title must be at least 10 characters";
      isValid = false;
    }

    if (formData.body.trim().length < 20) {
      newErrors.body = "Description must be at least 20 characters";
      isValid = false;
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      let imageStorageId;

      // 1️⃣ ถ้ามีรูปให้ upload ก่อน
      if (file) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();
        imageStorageId = storageId;
      }

      // 2️⃣ ยิงไป create post ที่ convex
      await createPost({
        title: formData.title,
        body: formData.body,
        category: formData.category,
        imageStorageId,
      });

      router.push("/posts");
    } catch (err) {
      console.error("Error creating post:", err);
    } finally {
      setIsSubmitting(false);
    }
  };


  // Handle file selection
  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;
    
    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    // Check file type
    if (!selectedFile.type.startsWith('image/')) {
      alert("Please upload an image file");
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    handleFileChange(droppedFile);
  };

  // Remove image
  const removeImage = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 mt-15">
      
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-300/20 to-amber-300/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-yellow-300/20 to-orange-300/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 pt-24 md:pt-28 pb-16">
        
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-5xl">✍️</span>
            <div>
              <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
                Create <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Question</span>
              </h1>
            </div>
          </div>
          <p className="text-gray-600 text-lg font-medium">
            Ask anything and get help from the community ✨
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 sm:p-8"
        >
          <div className="space-y-8">
            
            {/* Title Field */}
            <div>
              <label className="flex items-center gap-2 text-base font-bold text-gray-900 mb-3">
                <Type size={20} className="text-orange-600" />
                Question Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., How do I solve quadratic equations?"
                className={`w-full px-5 py-4 rounded-xl border-2 ${
                  errors.title 
                    ? "border-red-300 focus:border-red-500" 
                    : "border-gray-200 focus:border-orange-500"
                } focus:outline-none transition-all text-gray-900 placeholder-gray-400`}
              />
              {errors.title && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mt-2 text-red-600 text-sm font-medium"
                >
                  <AlertCircle size={16} />
                  {errors.title}
                </motion.div>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Be specific and clear. Make it easy for others to understand your question.
              </p>
            </div>

            {/* Category Selection */}
            <div>
              <label className="flex items-center gap-2 text-base font-bold text-gray-900 mb-3">
                <Tag size={20} className="text-orange-600" />
                Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFormData({ ...formData, category: category.id })}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      formData.category === category.id
                        ? `border-orange-500 bg-gradient-to-r ${category.color} shadow-lg`
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="text-3xl mb-2">{category.emoji}</div>
                    <div className={`text-sm font-bold ${
                      formData.category === category.id ? "text-white" : "text-gray-700"
                    }`}>
                      {category.label}
                    </div>
                  </motion.button>
                ))}
              </div>
              {errors.category && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mt-3 text-red-600 text-sm font-medium"
                >
                  <AlertCircle size={16} />
                  {errors.category}
                </motion.div>
              )}
            </div>

            {/* Body/Description Field */}
            <div>
              <label className="flex items-center gap-2 text-base font-bold text-gray-900 mb-3">
                <BookOpen size={20} className="text-orange-600" />
                Question Details
              </label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Provide more context about your question. What have you tried? What specific help do you need?"
                rows={8}
                className={`w-full px-5 py-4 rounded-xl border-2 ${
                  errors.body 
                    ? "border-red-300 focus:border-red-500" 
                    : "border-gray-200 focus:border-orange-500"
                } focus:outline-none transition-all text-gray-900 placeholder-gray-400 resize-none`}
              />
              {errors.body && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mt-2 text-red-600 text-sm font-medium"
                >
                  <AlertCircle size={16} />
                  {errors.body}
                </motion.div>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Include all relevant details. The more information you provide, the better answers you&apos;ll get.
              </p>
            </div>

            {/* Image Upload Field */}
            <div>
              <label className="flex items-center gap-2 text-base font-bold text-gray-900 mb-3">
                <ImageIcon size={20} className="text-orange-600" />
                Image (Optional)
              </label>

              {!previewUrl ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 transition-all ${
                    isDragging 
                      ? "border-orange-500 bg-orange-50" 
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                      <Upload size={32} className="text-orange-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {isDragging ? "Drop your image here" : "Upload an image"}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Drag and drop or click to browse
                    </p>
                    <p className="text-xs text-gray-400">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-50"
                >
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg transition-all hover:scale-110"
                  >
                    <X size={20} className="text-white" />
                  </button>

                  {/* Image Preview */}
                  <div className="relative w-full">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>

                  {/* File Info */}
                  <div className="p-4 bg-white border-t border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center flex-shrink-0">
                        <ImageIcon size={20} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-900 truncate">
                          {file?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {file && (file.size / 1024).toFixed(2)} KB
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <p className="mt-2 text-sm text-gray-500">
                Add an image to help illustrate your question (diagrams, screenshots, etc.)
              </p>
            </div>

            {/* Tips Section */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
              <div className="flex items-start gap-3">
                <Sparkles className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Tips for getting great answers:</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Make your title clear and descriptive</li>
                    <li>• Explain what you&apos;ve already tried</li>
                    <li>• Include relevant context or examples</li>
                    <li>• Choose the most appropriate category</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <motion.button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                className={`flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold shadow-lg transition-all ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-xl text-white"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span>Post Question</span>
                  </>
                )}
              </motion.button>

              <button
                type="button"
                onClick={() => {
                  setFormData({ title: "", body: "", category: "" });
                  setFile(null);
                  setPreviewUrl(null);
                }}
                className="px-8 py-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-all"
              >
                Cancel
              </button>
            </div>

          </div>
        </motion.div>

        {/* Preview Section */}
        {formData.title && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Preview</h3>
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-gray-900">{formData.title}</h4>
              {formData.category && (
                <div className="inline-flex">
                  <span className={`px-3 py-1 rounded-lg bg-gradient-to-r ${
                    categories.find(c => c.id === formData.category)?.color
                  } text-white text-sm font-bold`}>
                    {categories.find(c => c.id === formData.category)?.emoji}{" "}
                    {categories.find(c => c.id === formData.category)?.label}
                  </span>
                </div>
              )}
              {formData.body && (
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{formData.body}</p>
              )}
              {previewUrl && (
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-auto max-h-80 object-contain bg-gray-50"
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}

      </div>
    </div>
    <Footer/>
    </>
  );
}