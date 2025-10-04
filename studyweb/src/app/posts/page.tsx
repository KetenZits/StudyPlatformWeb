"use client";
import { motion } from "framer-motion";
import { MessageSquareText, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import Link from "next/link";
import Navbar from "../../../components/Navbar";

// Mock data - ในของจริงจะดึงจาก DB
const mockPosts = [
  {
    id: 1,
    username: "JohnDoe",
    avatar: "JD",
    title: "How to solve quadratic equations?",
    description: "I want to know why the answer is this? Can someone explain step by step the process of solving quadratic equations using the formula?",
    category: "Math",
    categoryEmoji: "📐",
    categoryColor: "from-blue-500 to-cyan-500",
    time: "5m ago",
    answers: 3,
  },
  {
    id: 2,
    username: "SarahTech",
    avatar: "ST",
    title: "Best way to learn React Native?",
    description: "Looking for resources and tutorials for beginners. What are the essential concepts I should focus on first?",
    category: "Programming",
    categoryEmoji: "💻",
    categoryColor: "from-purple-500 to-pink-500",
    time: "12m ago",
    answers: 7,
  },
  {
    id: 3,
    username: "BiologyGeek",
    avatar: "BG",
    title: "Photosynthesis process explanation",
    description: "Need help understanding the light-dependent reactions. How does chlorophyll actually capture light energy?",
    category: "Biology",
    categoryEmoji: "🧬",
    categoryColor: "from-green-500 to-emerald-500",
    time: "1h ago",
    answers: 2,
  },
  {
    id: 4,
    username: "PhysicsNerd",
    avatar: "PN",
    title: "Understanding quantum mechanics basics",
    description: "Can someone explain the double-slit experiment in simple terms? I'm having trouble grasping the concept.",
    category: "Physics",
    categoryEmoji: "⚛️",
    categoryColor: "from-orange-500 to-red-500",
    time: "2h ago",
    answers: 5,
  },
  {
    id: 5,
    username: "HistoryBuff",
    avatar: "HB",
    title: "World War II timeline question",
    description: "What were the key turning points in World War II? I need to understand the major events that changed the course of the war.",
    category: "History",
    categoryEmoji: "📚",
    categoryColor: "from-amber-500 to-yellow-500",
    time: "3h ago",
    answers: 8,
  },
  {
    id: 6,
    username: "ChemLover",
    avatar: "CL",
    title: "Balancing chemical equations help",
    description: "I'm struggling with balancing complex chemical equations. Any tips or tricks to make this easier?",
    category: "Chemistry",
    categoryEmoji: "🧪",
    categoryColor: "from-teal-500 to-cyan-500",
    time: "4h ago",
    answers: 4,
  },
];

const categories = ["All", "Math", "Programming", "Biology", "Physics", "History", "Chemistry"];

export default function PostsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
  <>
    <Navbar/>
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 mt-10">
      
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-5 md:px-8 pt-24 md:pt-28 pb-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl">📄</span>
            <div>
              <span className="text-lg text-gray-600 font-medium">
                Browse & Answer{" "}
                <span className="font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent text-xl">
                  Questions
                </span>
              </span>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-4 tracking-tight">
            Find & Answer{" "}
            <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-orange-700 bg-clip-text text-transparent">
              Posts
            </span>
          </h1>
          
          <p className="text-gray-600 text-lg font-medium">
            Help others learn by sharing your knowledge ✨
          </p>
        </motion.div>
      </div>

      {/* Posts Grid */}
      <div className="max-w-7xl mx-auto px-5 md:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mockPosts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              whileHover={{ y: -6, scale: 1.01 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-white/50 cursor-pointer group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-sm">{post.avatar}</span>
                  </div>
                  {/* User Info */}
                  <div>
                    <div className="font-bold text-gray-900 text-base">{post.username}</div>
                    <div className="text-xs text-gray-500 font-medium">{post.time}</div>
                  </div>
                </div>

                {/* Category Badge */}
                <div className={`px-3 py-1.5 rounded-xl bg-gradient-to-r ${post.categoryColor} shadow-md`}>
                  <span className="text-xs font-bold text-white">
                    {post.categoryEmoji} {post.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                  {post.description}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl">
                  <MessageSquareText size={16} className="text-orange-600" />
                  <span className="text-sm font-bold text-orange-600">
                    {post.answers} answers
                  </span>
                </div>

                <Link href={`/posts/${post.id}`}>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold hover:shadow-lg transition-all group-hover:gap-3">
                    <span className="text-sm">View</span>
                    <ChevronRight size={16} />
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More Button */}
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
      </div>
    </div>
    </>
  );
}