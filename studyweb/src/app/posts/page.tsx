"use client";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquareText, ChevronRight, CirclePlus, Search, X, SlidersHorizontal } from "lucide-react";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import Sidebar from "../../../components/Sidebar";
import Footer from "../../../components/Footer";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { BookOpen } from "lucide-react";

const categories = [
  { id: "all", label: "All", emoji: "🌐" },
  { id: "math", label: "Math", emoji: "📐" },
  { id: "programming", label: "Programming", emoji: "💻" },
  { id: "biology", label: "Biology", emoji: "🧬" },
  { id: "physics", label: "Physics", emoji: "⚛️" },
  { id: "chemistry", label: "Chemistry", emoji: "🧪" },
  { id: "history", label: "History", emoji: "📚" },
  { id: "english", label: "English", emoji: "📖" },
  { id: "other", label: "Other", emoji: "🌟" },
];

type SortOption = "newest" | "oldest" | "most_answers";

export default function PostsPage() {
  const posts = useQuery(api.posts.getAllPosts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(true);

  // Client-side filtering & sorting
  const filteredPosts = useMemo(() => {
    if (!posts) return [];

    let result = [...posts];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.body.toLowerCase().includes(query) ||
          (post.username && post.username.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((post) => post.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case "oldest":
        result.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case "most_answers":
        result.sort((a, b) => (b.answersCount ?? 0) - (a.answersCount ?? 0));
        break;
    }

    return result;
  }, [posts, searchQuery, selectedCategory, sortBy]);

  if (posts === undefined) {
    return (
      <>
        <Sidebar />
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 lg:pl-[280px]">
          <div className="relative flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute w-24 h-24 rounded-full border-t-4 border-r-4 border-orange-500/30 border-t-orange-500 border-r-transparent"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute w-16 h-16 rounded-full border-b-4 border-l-4 border-blue-500/30 border-b-blue-500 border-l-transparent"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 bg-white p-3 rounded-full shadow-sm"
            >
              <BookOpen className="w-8 h-8 text-orange-600" />
            </motion.div>
            <div className="absolute inset-0 bg-orange-400/20 blur-xl rounded-full animate-pulse"></div>
          </div>
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
    return (
      <>
        <Sidebar />
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center lg:pl-[280px]">
          <div className="text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No posts yet</h2>
            <p className="text-gray-500 mb-6">Be the first to ask a question!</p>
            <Link href="/posts/create">
              <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4A574] to-[#B8873D] text-white font-bold">
                Create Post
              </button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 lg:pl-[280px]">

        {/* Header Section */}
        <div className="max-w-7xl mx-auto px-5 md:px-8 pt-20 md:pt-12 pb-4">
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

          <Link href="/posts/create">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4A574] via-[#C9984E] to-[#B8873D] text-white font-semibold hover:shadow-lg transition-all mt-5 cursor-pointer">
              <span className="text-xl">Create Post</span>
              <CirclePlus size={24} />
            </button>
          </Link>
        </div>

        {/* Search & Filter Section */}
        <div className="max-w-7xl mx-auto px-5 md:px-8 pb-6">
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/50"
          >
            {/* Search Bar */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions by title, content, or author..."
                  className="w-full pl-12 pr-10 py-3.5 rounded-xl border-2 border-gray-200 focus:border-[#C9984E] focus:outline-none transition-all text-gray-900 placeholder-gray-400 bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X size={16} className="text-gray-400" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3.5 rounded-xl border-2 transition-all ${showFilters ? "border-[#C9984E] bg-amber-50 text-[#C9984E]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
              >
                <SlidersHorizontal size={20} />
              </button>
            </div>

            {/* Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {/* Category Chips */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                          selectedCategory === cat.id
                            ? "bg-gradient-to-r from-[#D4A574] to-[#B8873D] text-white shadow-md"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        <span className="mr-1">{cat.emoji}</span>
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Sort Options */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-500">Sort by:</span>
                    {([
                      { value: "newest" as SortOption, label: "🕐 Newest" },
                      { value: "most_answers" as SortOption, label: "💬 Most Answers" },
                      { value: "oldest" as SortOption, label: "📅 Oldest" },
                    ]).map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                          sortBy === option.value
                            ? "bg-amber-100 text-[#B8873D] border border-amber-300"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Results Count */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500 font-medium">
              {filteredPosts.length} {filteredPosts.length === 1 ? "post" : "posts"} found
              {searchQuery && <span> for &ldquo;<span className="font-bold text-gray-700">{searchQuery}</span>&rdquo;</span>}
              {selectedCategory !== "all" && <span> in <span className="font-bold text-[#B8873D]">{categories.find(c => c.id === selectedCategory)?.label}</span></span>}
            </p>
            {(searchQuery || selectedCategory !== "all") && (
              <button
                onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                className="text-sm font-semibold text-[#C9984E] hover:text-[#B8873D] transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Posts Grid */}
        <div className="max-w-7xl mx-auto px-5 md:px-8 pb-16">
          {filteredPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4A574] to-[#B8873D] text-white font-bold hover:shadow-lg transition-all"
              >
                Clear All Filters
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPosts.map((post, i) => (
                <motion.div
                  key={post._id}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.03 }}
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
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}