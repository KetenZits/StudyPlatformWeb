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

type SortOption = "newest" | "oldest" | "most_answers";

export default function PostsPage() {
  const posts = useQuery(api.posts.getAllPosts);
  const dbCategories = useQuery(api.categories.getCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(true);

  // Build categories from DB, with "All" prepended
  const categories = useMemo(() => {
    const allOption = { id: "all", label: "All", emoji: "🌐" };
    if (!dbCategories || dbCategories.length === 0) {
      // Fallback if DB not seeded
      return [allOption,
        { id: "math", label: "Math", emoji: "📐" }, { id: "science", label: "Science", emoji: "🔬" },
        { id: "thai", label: "Thai", emoji: "📖" }, { id: "english", label: "English", emoji: "🌍" },
        { id: "social", label: "Social", emoji: "🌏" }, { id: "computer", label: "Computer", emoji: "💻" },
        { id: "art", label: "Art", emoji: "🎨" }, { id: "other", label: "Other", emoji: "📚" },
      ];
    }
    return [allOption, ...dbCategories.map((c) => {
      const parts = c.name.match(/^(\S+)\s+(.+)$/);
      return { id: c.slug, label: parts ? parts[2] : c.name, emoji: parts ? parts[1] : "📂" };
    })];
  }, [dbCategories]);

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    let result = [...posts];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((post) =>
        post.title.toLowerCase().includes(query) || post.body.toLowerCase().includes(query) || (post.username && post.username.toLowerCase().includes(query))
      );
    }
    if (selectedCategory !== "all") result = result.filter((post) => post.category === selectedCategory);
    switch (sortBy) {
      case "newest": result.sort((a, b) => b.createdAt - a.createdAt); break;
      case "oldest": result.sort((a, b) => a.createdAt - b.createdAt); break;
      case "most_answers": result.sort((a, b) => (b.answersCount ?? 0) - (a.answersCount ?? 0)); break;
    }
    return result;
  }, [posts, searchQuery, selectedCategory, sortBy]);

  if (posts === undefined) {
    return (<><Sidebar /><div className="flex flex-col items-center justify-center min-h-screen gap-6 lg:pl-[280px] bg-[#e0e5ec]">
      <div className="relative flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute w-24 h-24 rounded-full border-t-4 border-r-4 border-purple-500/30 border-t-purple-500 border-r-transparent" />
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="relative z-10 p-3 rounded-full nm-raised"><BookOpen className="w-8 h-8 text-purple-600" /></motion.div>
      </div>
      <div className="text-center space-y-2"><h3 className="text-lg font-bold text-gray-700">Gathering Knowledge...</h3><p className="text-sm text-gray-400">Prepare Post for you.</p></div>
    </div><Footer /></>);
  }

  if (posts.length === 0) {
    return (<><Sidebar /><div className="min-h-screen bg-[#e0e5ec] flex items-center justify-center lg:pl-[280px]"><div className="text-center">
      <div className="text-6xl mb-4">📭</div><h2 className="text-2xl font-bold text-gray-800 mb-2">No posts yet</h2><p className="text-gray-500 mb-6">Be the first to ask a question!</p>
      <Link href="/posts/create"><button className="px-6 py-3 rounded-xl nm-gradient-btn">Create Post</button></Link>
    </div></div><Footer /></>);
  }

  return (<><Sidebar /><div className="min-h-screen bg-[#e0e5ec] lg:pl-[280px]">
    <div className="max-w-7xl mx-auto px-5 md:px-8 pt-20 md:pt-12 pb-4">
      <div className="flex items-center gap-3 mb-4"><span className="text-5xl">📄</span><span className="text-lg text-gray-500 font-medium">Browse & Answer <span className="font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent text-xl">Questions</span></span></div>
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-800 mb-4 tracking-tight">Find & Answer <span className="bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 bg-clip-text text-transparent">Posts</span></h1>
      <p className="text-gray-500 text-lg font-medium">Help others learn by sharing your knowledge ✨</p>
      <Link href="/posts/create"><button className="flex items-center gap-2 px-4 py-2 rounded-xl nm-gradient-btn mt-5 cursor-pointer"><span className="text-xl">Create Post</span><CirclePlus size={24} /></button></Link>
    </div>

    <div className="max-w-7xl mx-auto px-5 md:px-8 pb-6">
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="nm-raised p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative"><Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search questions..." className="w-full pl-12 pr-10 py-3.5 rounded-xl nm-input" />
            {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/5"><X size={16} className="text-gray-400" /></button>}
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`p-3.5 rounded-xl transition-all ${showFilters ? "text-purple-600" : "nm-btn text-gray-500"}`} style={showFilters ? { boxShadow: 'inset 3px 3px 6px #a3b1c6, inset -3px -3px 6px #ffffff', background: '#e0e5ec' } : {}}><SlidersHorizontal size={20} /></button>
        </div>
        <AnimatePresence>{showFilters && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
          <div className="flex flex-wrap gap-2 mb-4 mt-2 justify-center">{categories.map((cat) => (<button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedCategory === cat.id ? "nm-gradient-btn" : "nm-btn text-gray-600"}`}><span className="mr-1">{cat.emoji}</span>{cat.label}</button>))}</div>
          <div className="flex items-center gap-3"><span className="text-sm font-semibold text-gray-500">Sort by:</span>
            {([{ value: "newest" as SortOption, label: "🕐 Newest" }, { value: "most_answers" as SortOption, label: "💬 Most Answers" }, { value: "oldest" as SortOption, label: "📅 Oldest" }]).map((o) => (
              <button key={o.value} onClick={() => setSortBy(o.value)} className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${sortBy === o.value ? "text-purple-700" : "text-gray-500"}`} style={sortBy === o.value ? { boxShadow: 'inset 2px 2px 4px #a3b1c6, inset -2px -2px 4px #ffffff', background: '#e0e5ec' } : {}}>{o.label}</button>
            ))}</div>
        </motion.div>)}</AnimatePresence>
      </motion.div>
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-500 font-medium">{filteredPosts.length} posts found{searchQuery && <span> for &ldquo;<span className="font-bold text-gray-700">{searchQuery}</span>&rdquo;</span>}{selectedCategory !== "all" && <span> in <span className="font-bold text-purple-600">{categories.find(c => c.id === selectedCategory)?.label}</span></span>}</p>
        {(searchQuery || selectedCategory !== "all") && <button onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }} className="text-sm font-semibold text-purple-600 hover:text-purple-800">Clear filters</button>}
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-5 md:px-8 pb-16">
      {filteredPosts.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20"><div className="text-6xl mb-4">🔍</div><h3 className="text-2xl font-bold text-gray-800 mb-2">No results found</h3><p className="text-gray-500 mb-6">Try adjusting your search</p><button onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }} className="px-6 py-3 rounded-xl nm-gradient-btn">Clear All Filters</button></motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPosts.map((post, i) => (
            <motion.div key={post._id} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 + i * 0.03 }} whileHover={{ y: -6, scale: 1.01 }} className="nm-raised p-6 transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <Link href={`/profile/${post.userId}`} className="flex items-center gap-3 group/author">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', boxShadow: '3px 3px 6px #a3b1c6, -3px -3px 6px #ffffff' }}>
                    {post.avatar ? <img src={post.avatar} alt={post.username || "User"} className="w-full h-full object-cover" /> : <span className="text-white font-bold text-sm">{post.username?.[0]?.toUpperCase() ?? "U"}</span>}
                  </div>
                  <div><div className="font-bold text-gray-800 text-base group-hover/author:text-purple-600 transition-colors">{post.username ?? "Anonymous"}</div><div className="text-xs text-gray-500 font-medium">{new Date(post.createdAt).toLocaleDateString()}</div></div>
                </Link>
                <div className="px-3 py-1.5 rounded-xl text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>{post.category ?? "General"}</div>
              </div>
              {post.imageUrl && <img src={post.imageUrl} alt="Post" className="rounded-xl mb-4 max-h-60 w-full object-cover" style={{ boxShadow: '4px 4px 8px #a3b1c6' }} />}
              <div className="mb-4"><h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">{post.title}</h3><p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{post.body}</p></div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-300/40">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl nm-inset-xs"><MessageSquareText size={16} className="text-purple-500" /><span className="text-sm font-bold text-purple-600">{post.answersCount ?? 0} answers</span></div>
                <Link href={`/posts/${post._id}`}><button className="flex items-center gap-2 px-4 py-2 rounded-xl nm-gradient-btn text-sm"><span>View</span><ChevronRight size={16} /></button></Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  </div><Footer /></>);
}