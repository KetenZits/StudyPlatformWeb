"use client";
import { motion } from "framer-motion";
import { MessageSquareText, ChevronRight, CirclePlus } from "lucide-react";
import React, { useState } from "react";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { BookOpen, Loader2 } from "lucide-react";


export default function PostsPage() {
  const posts = useQuery(api.posts.getAllPosts);

  if (posts === undefined) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen gap-6">
          <div className="relative flex items-center justify-center">

            {/* วงแหวนที่ 1: หมุนตามเข็มนาฬิกา (สีส้ม Theme หลัก) */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute w-24 h-24 rounded-full border-t-4 border-r-4 border-orange-500/30 border-t-orange-500 border-r-transparent"
            />

            {/* วงแหวนที่ 2: หมุนทวนเข็มนาฬิกา (สีฟ้า สื่อถึงปัญญา/การเรียนรู้) */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute w-16 h-16 rounded-full border-b-4 border-l-4 border-blue-500/30 border-b-blue-500 border-l-transparent"
            />

            {/* ไอคอนตรงกลาง: Effect หายใจ (Scale Up/Down) */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 bg-white p-3 rounded-full shadow-sm"
            >
              <BookOpen className="w-8 h-8 text-orange-600" />
            </motion.div>

            {/* Background Glow จางๆ */}
            <div className="absolute inset-0 bg-orange-400/20 blur-xl rounded-full animate-pulse"></div>
          </div>

          {/* Loading Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-2"
          >
            <h3 className="text-lg font-bold text-gray-700">Gathering Knowledge...</h3>
            <p className="text-sm text-gray-400">Prepare Post for you.</p>
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  if (posts.length === 0) {
    return <div>No posts yet 😢</div>;
  }

  console.log(posts)

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-17">

        {/* Header Section */}
        <div className="max-w-7xl mx-auto px-5 md:px-8 pt-24 md:pt-28 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl">📄</span>
            <div>
              <span className="text-lg text-gray-600 font-medium">
                Browse & Answer{" "}
                <span className="font-bold bg-gradient-to-r from-[#D4A574] via-[#C9984E] to-[#B8873D] bg-clip-text text-transparent text-xl">
                  Questions
                </span>
              </span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-4 tracking-tight">
            Find & Answer{" "}
            <span className="bg-gradient-to-r from-[#D4A574] via-[#C9984E] to-[#B8873D] bg-clip-text text-transparent">
              Posts
            </span>
          </h1>

          <p className="text-gray-600 text-lg font-medium">
            Help others learn by sharing your knowledge ✨
          </p>

          <Link href={`/posts/create`}>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4A574] via-[#C9984E] to-[#B8873D] text-white font-semibold hover:shadow-lg transition-all group-hover:gap-3 mt-5 cursor-pointer">
              <span className="text-xl">Create Post</span>
              <CirclePlus size={24} />
            </button>
          </Link>
        </div>

        {/* Posts Grid */}
        <div className="max-w-7xl mx-auto px-5 md:px-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {posts.map((post, i) => (
              <motion.div
                key={post._id}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                whileHover={{ y: -6, scale: 1.01 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-white/50 cursor-pointer group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <Link href={`/profile/${post.userId}`} className="flex items-center gap-3 group/author">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#D4A574] via-[#C9984E] to-[#B8873D] flex items-center justify-center shadow-md">
                      {post.avatar ? (
                        <img
                          src={post.avatar}
                          alt={post.username || "User"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-sm">
                          {post.username?.[0]?.toUpperCase() ?? "U"}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-base group-hover/author:text-[#B8873D] transition-colors">
                        {post.username ?? "Anonymous"}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>

                  <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-400 to-yellow-500 shadow-md">
                    <span className="text-xs font-bold text-white">
                      {post.category ?? "General"}
                    </span>
                  </div>
                </div>

                {/* Image (optional) */}
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt="Post Image"
                    className="rounded-xl mb-4 max-h-60 w-full object-cover shadow-md"
                  />
                )}

                {/* Content */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#B8873D] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                    {post.body}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl">
                    <MessageSquareText size={16} className="text-[#B8873D]" />
                    <span className="text-sm font-bold text-[#B8873D]">
                      {post.answersCount ?? 0} answers
                    </span>
                  </div>

                  <Link href={`/posts/${post._id}`}>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4A574] via-[#C9984E] to-[#B8873D] text-white font-semibold hover:shadow-lg transition-all group-hover:gap-3">
                      <span className="text-sm">View</span>
                      <ChevronRight size={16} />
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Load More Button */}
          {posts.length > 10 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex justify-center mt-12"
            >
              <button className="px-8 py-4 rounded-2xl bg-white/90 backdrop-blur-sm border border-white/50 shadow-lg hover:shadow-2xl text-gray-900 font-bold transition-all hover:scale-105">
                Load More Posts
              </button>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}