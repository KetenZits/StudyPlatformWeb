"use client";
import { motion } from "framer-motion";
import { Save, X, User, FileText, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Navbar from "../../../../components/Navbar";
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

  // Set initial values when user data loads
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setBio(currentUser.bio || "");
      setPreviewUrl(currentUser.profilePic || null);
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      await updateProfile({ name, bio });
      setStatus({ type: "success", message: "Profile updated successfully!" });
      
      // Redirect after 1.5 seconds
      setTimeout(() => {
        window.location.href = "/profile";
      }, 1500);
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Failed to update profile" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-orange-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 mt-15">
      
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-300/20 to-amber-300/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-yellow-300/20 to-orange-300/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 pt-24 md:pt-28 pb-16">
        
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-5xl font-black text-gray-900 mb-2">Edit <span className="bg-gradient-to-r from-[#D4A574] via-[#C9984E] to-[#B8873D] bg-clip-text text-transparent">Profile</span></h1>
              <p className="text-gray-600 text-base">Update your personal information</p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
            >
              <X size={20} className="text-gray-700" />
            </button>
          </div>
        </motion.div>

        {/* Status Message */}
        {status.message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-2xl ${
              status.type === "success" 
                ? "bg-green-50 border border-green-200" 
                : "bg-red-50 border border-red-200"
            }`}
          >
            <p className={`text-sm font-semibold ${
              status.type === "success" ? "text-green-700" : "text-red-700"
            }`}>
              {status.message}
            </p>
          </motion.div>
        )}

        {/* Form Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 sm:p-8"
        >
          
          {/* Profile Picture Section */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <label className="flex items-center gap-2 text-base font-bold text-gray-900 mb-4">
              <span className="text-2xl">📷</span>
              Profile Picture
            </label>

            <div className="flex flex-col items-center gap-6">
              {/* Avatar Preview & Editor */}
                <ProfilePicEditor
                  currentImage={previewUrl}
                  onImageSelect={(tempUrl) => {
                    setPreviewUrl(tempUrl);
                  }}
                  onSave={async (finalUrl, storageId) => {
                    // Update preview logic
                    setPreviewUrl(finalUrl);
                    // Update in Convex
                    await updateProfilePic({ storageId });
                    setStatus({ type: "success", message: "Profile picture updated!" });
                  }}
                />

              {/* Upload Info */}
              <div className="flex-1 text-center sm:text-left">
                <p className="text-sm text-gray-500">
                  JPG, PNG or GIF. Max size 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            
            {/* Name Field */}
            <div>
              <label className="flex items-center gap-2 text-base font-bold text-gray-900 mb-3">
                <User size={20} className="text-orange-600" />
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-all text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Bio Field */}
            <div>
              <label className="flex items-center gap-2 text-base font-bold text-gray-900 mb-3">
                <FileText size={20} className="text-orange-600" />
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={6}
                className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-all text-gray-900 placeholder-gray-400 resize-none"
              />
              <p className="text-sm text-gray-500 mt-2">
                Write a short bio to let others know more about you
              </p>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-gray-200">
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
                  <Loader2 size={20} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Save Changes</span>
                </>
              )}
            </motion.button>

            <button
              type="button"
              onClick={() => window.history.back()}
              disabled={isSubmitting}
              className="px-8 py-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-all disabled:opacity-50"
            >
              Cancel
            </button>
          </div>

        </motion.div>

      </div>
    </div>
    <Footer/>
    </>
  );
}