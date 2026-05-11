"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Calendar, MessageSquareText, Award, Send, Loader2, ThumbsUp, Pencil, Trash2, X, Check } from "lucide-react";
import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Id } from "../../../../convex/_generated/dataModel";
import Sidebar from "../../../../components/Sidebar";
import Footer from "../../../../components/Footer";
import MarkAsBestButton from "../../../../components/MarkAsBestButton";
import LikeButton from "../../../../components/LikeButton";
import ReportButton from "../../../../components/ReportButton";
import { useToast } from "../../../../components/Toast";
import RichTextEditor from "../../../../components/RichTextEditor";
import MarkdownRenderer from "../../../../components/MarkdownRenderer";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as Id<"posts">;
  const post = useQuery(api.posts.getPostById, { postId });
  const answers = useQuery(api.answers.getAnswersByPostId, { postId });
  const currentUser = useQuery(api.users.getCurrentUser);
  const createAnswer = useMutation(api.answers.createAnswer);
  const deletePost = useMutation(api.posts.deletePost);
  const updatePost = useMutation(api.posts.updatePost);
  const deleteAnswer = useMutation(api.answers.deleteAnswer);
  const updateAnswer = useMutation(api.answers.updateAnswer);

  const [answerText, setAnswerText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingPost, setEditingPost] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [editAnswerBody, setEditAnswerBody] = useState("");
  const [deletingAnswerId, setDeletingAnswerId] = useState<string | null>(null);
  const toast = useToast();

  const isOwner = currentUser && post && currentUser._id === post.userId;
  const isAdmin = currentUser && (currentUser.role === "admin" || currentUser.role === "Admin" || currentUser.role === "developer" || currentUser.role === "Developer");

  const handleSubmitAnswer = async () => {
    if (!answerText.trim() || !currentUser) return;
    setIsSubmitting(true);
    try {
      const res = await createAnswer({ postId, body: answerText });
      setAnswerText("");
      toast.streak(`Streak: ${res.streak} วันติดแล้ว! 🔥`, `ตอบสำเร็จ! เหลือเวลา ${res.timeLeft.hoursLeft}h ${res.timeLeft.minutesLeft}m ก่อนหมดวัน`);
    } catch (error) {
      console.error("Error posting answer:", error);
      toast.error("Error", "Failed to post answer");
    } finally { setIsSubmitting(false); }
  };

  const handleDeletePost = async () => {
    try {
      await deletePost({ postId });
      toast.success("Deleted", "Post has been deleted.");
      router.push("/posts");
    } catch (err) { toast.error("Error", (err as Error).message); }
  };

  const handleEditPost = async () => {
    if (!editTitle.trim() || !editBody.trim()) return;
    try {
      await updatePost({ postId, title: editTitle, body: editBody, category: post!.category });
      setEditingPost(false);
      toast.success("Updated", "Post has been updated.");
    } catch (err) { toast.error("Error", (err as Error).message); }
  };

  const handleDeleteAnswer = async (answerId: Id<"answers">) => {
    try {
      await deleteAnswer({ answerId });
      toast.success("Deleted", "Answer has been deleted.");
      setDeletingAnswerId(null);
    } catch (err) { toast.error("Error", (err as Error).message); }
  };

  const handleEditAnswer = async (answerId: Id<"answers">) => {
    if (!editAnswerBody.trim()) return;
    try {
      await updateAnswer({ answerId, body: editAnswerBody });
      setEditingAnswerId(null);
      toast.success("Updated", "Answer has been updated.");
    } catch (err) { toast.error("Error", (err as Error).message); }
  };

  const startEditPost = () => {
    setEditTitle(post!.title);
    setEditBody(post!.body);
    setEditingPost(true);
  };

  const getInitials = (name: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || "U";

  if (post === undefined || answers === undefined) {
    return (<div className="min-h-screen bg-[#e0e5ec] flex items-center justify-center"><div className="text-center"><Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" /><h2 className="text-2xl font-bold text-gray-800">Loading...</h2></div></div>);
  }
  if (!post) {
    return (<div className="min-h-screen bg-[#e0e5ec] flex items-center justify-center"><div className="text-center"><h2 className="text-2xl font-bold text-gray-800 mb-4">Post not found</h2><Link href="/posts"><button className="px-6 py-3 rounded-xl nm-gradient-btn">Back to Posts</button></Link></div></div>);
  }

  return (<><Sidebar /><div className="min-h-screen bg-[#e0e5ec] lg:pl-[280px]">
    <div className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 pt-20 md:pt-12 pb-16">
      <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="mb-6">
        <Link href="/posts"><button className="flex items-center gap-2 px-4 py-2 rounded-xl nm-btn text-gray-600 font-semibold transition-all"><ArrowLeft size={18} /><span>Back to Posts</span></button></Link>
      </motion.div>

      {/* Main Post Card */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="nm-raised p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <Link href={`/profile/${post.userId}`} className="flex items-center gap-4 group/author">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', boxShadow: '4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff' }}>
              {post.author?.profilePic ? <img src={post.author.profilePic} alt={post.author.name} className="w-full h-full object-cover" /> : <span className="text-white font-black text-xl">{getInitials(post.author?.name || "User")}</span>}
            </div>
            <div><h3 className="text-lg font-bold text-gray-800 group-hover/author:text-purple-600 transition-colors">{post.author?.name || "Anonymous"}</h3><div className="flex items-center gap-2 text-sm text-gray-500 mt-1"><Calendar size={14} /><span>{new Date(post.createdAt).toLocaleDateString()}</span></div></div>
          </Link>
          <div className="flex items-center gap-2">
            <div className="px-4 py-2 rounded-xl text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>📚 {post.category}</div>
          </div>
        </div>

        {/* Edit Mode or Display */}
        {editingPost ? (
          <div className="space-y-4 mb-6">
            <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full nm-input px-4 py-3 rounded-xl text-xl font-bold" />
            <RichTextEditor value={editBody} onChange={setEditBody} placeholder="Edit your post..." minHeight="150px" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditingPost(false)} className="px-4 py-2 rounded-xl nm-btn text-gray-600 font-bold text-sm"><X size={16} className="inline mr-1" />Cancel</button>
              <button onClick={handleEditPost} className="px-4 py-2 rounded-xl nm-gradient-btn text-sm"><Check size={16} className="inline mr-1" />Save</button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-800 mb-4 leading-tight">{post.title}</h1>
            <div className="nm-inset p-6 mb-6"><MarkdownRenderer content={post.body} /></div>
          </>
        )}

        {post.imageUrl && <div className="mb-6"><img src={post.imageUrl} alt="Post" className="w-full rounded-2xl max-h-96 object-contain" style={{ boxShadow: '6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff' }} /></div>}

        <div className="flex items-center gap-3 pt-6 border-t border-gray-300/40 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl nm-inset-xs"><MessageSquareText size={18} className="text-blue-500" /><span className="text-sm font-bold text-blue-600">{answers?.length || 0} Answers</span></div>
          {/* Owner/Admin actions */}
          {(isOwner || isAdmin) && !editingPost && (
            <>
              {isOwner && <button onClick={startEditPost} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg nm-btn text-sm font-medium text-gray-500 hover:text-blue-600"><Pencil size={14} />Edit</button>}
              <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg nm-btn text-sm font-medium text-gray-500 hover:text-red-600"><Trash2 size={14} />Delete</button>
            </>
          )}
          {currentUser && !isOwner && <ReportButton targetType="post" targetId={postId} />}
        </div>

        {/* Delete Confirmation */}
        <AnimatePresence>{showDeleteConfirm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-4 p-4 rounded-xl border-2 border-red-300 bg-red-50/30 flex items-center justify-between gap-4">
              <p className="text-sm font-bold text-red-600">⚠️ Are you sure? This will delete the post and all answers.</p>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setShowDeleteConfirm(false)} className="px-3 py-1.5 rounded-lg nm-btn text-sm font-bold text-gray-600">Cancel</button>
                <button onClick={handleDeletePost} className="px-3 py-1.5 rounded-lg text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>Delete</button>
              </div>
            </div>
          </motion.div>
        )}</AnimatePresence>
      </motion.div>

      {/* Answer Form */}
      {currentUser && (<motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="nm-raised p-6 sm:p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Answer</h2>
        <div className="mb-4"><RichTextEditor value={answerText} onChange={setAnswerText} placeholder="Share your knowledge... (Markdown supported)" minHeight="150px" /></div>
        <div className="flex justify-end"><motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmitAnswer} disabled={!answerText.trim() || isSubmitting}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${!answerText.trim() || isSubmitting ? "nm-btn text-gray-400 cursor-not-allowed" : "nm-gradient-btn"}`}>
          {isSubmitting ? <><Loader2 size={18} className="animate-spin" /><span>Posting...</span></> : <><Send size={18} /><span>Post Answer</span></>}
        </motion.button></div>
      </motion.div>)}

      {/* Answers Section */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Answers ({answers?.length || 0})</h2>
        {answers && answers.length > 0 ? (
          <div className="space-y-4">{answers.map((answer, i) => {
            const isAnswerOwner = currentUser?._id === answer.userId;
            const isEditing = editingAnswerId === answer._id;
            const isDeleting = deletingAnswerId === answer._id;

            return (
            <motion.div key={answer._id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 + i * 0.05 }}
              className={`nm-raised p-6 ${answer._id === post.bestAnswerId ? "ring-2 ring-green-400" : ""}`}>
              {answer._id === post.bestAnswerId && <div className="flex items-center gap-2 mb-4 text-green-600"><Award size={20} /><span className="font-bold text-sm">Best Answer</span></div>}
              <div className="flex items-start justify-between mb-4">
                <Link href={`/profile/${answer.userId}`} className="flex items-center gap-3 group/author">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', boxShadow: '3px 3px 6px #a3b1c6, -3px -3px 6px #ffffff' }}>
                    {answer.author?.profilePic ? <img src={answer.author.profilePic} alt={answer.author.name} className="w-full h-full object-cover" /> : <span className="text-white font-bold text-sm">{getInitials(answer.author?.name || "User")}</span>}
                  </div>
                  <div><h4 className="font-bold text-gray-800 group-hover/author:text-purple-600 transition-colors">{answer.author?.name || "Anonymous"}</h4><p className="text-xs text-gray-500">{new Date(answer.createdAt).toLocaleDateString()}</p></div>
                </Link>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg nm-inset-xs"><ThumbsUp size={14} className="text-purple-500" /><span className="text-sm font-bold text-purple-600">{answer.likes?.length || 0}</span></div>
              </div>

              {/* Edit or Display */}
              {isEditing ? (
                <div className="space-y-3 mt-4">
                  <RichTextEditor value={editAnswerBody} onChange={setEditAnswerBody} placeholder="Edit your answer..." minHeight="120px" />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingAnswerId(null)} className="px-3 py-1.5 rounded-lg nm-btn text-sm font-bold text-gray-600"><X size={14} className="inline mr-1" />Cancel</button>
                    <button onClick={() => handleEditAnswer(answer._id)} className="px-3 py-1.5 rounded-lg nm-gradient-btn text-sm"><Check size={14} className="inline mr-1" />Save</button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 nm-inset p-4"><MarkdownRenderer content={answer.body} /></div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-300/40 flex-wrap">
                <LikeButton answer={answer} currentUser={currentUser} />
                {currentUser?._id === post.userId && answer._id !== post.bestAnswerId && <MarkAsBestButton post={post} answer={answer} currentUser={currentUser} />}
                {(isAnswerOwner || isAdmin) && !isEditing && (
                  <>
                    {isAnswerOwner && <button onClick={() => { setEditingAnswerId(answer._id); setEditAnswerBody(answer.body); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-blue-600 transition-all"><Pencil size={14} />Edit</button>}
                    <button onClick={() => setDeletingAnswerId(answer._id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-600 transition-all"><Trash2 size={14} />Delete</button>
                  </>
                )}
                {currentUser && !isAnswerOwner && <ReportButton targetType="answer" targetId={answer._id} />}
              </div>

              {/* Delete Confirm */}
              <AnimatePresence>{isDeleting && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="mt-3 p-3 rounded-xl border-2 border-red-300 bg-red-50/30 flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-red-600">Delete this answer?</p>
                    <div className="flex gap-2">
                      <button onClick={() => setDeletingAnswerId(null)} className="px-3 py-1 rounded-lg nm-btn text-xs font-bold text-gray-600">Cancel</button>
                      <button onClick={() => handleDeleteAnswer(answer._id)} className="px-3 py-1 rounded-lg text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>Delete</button>
                    </div>
                  </div>
                </motion.div>
              )}</AnimatePresence>
            </motion.div>
          )})}</div>
        ) : (
          <div className="nm-raised p-12 text-center"><div className="text-6xl mb-4">💭</div><h3 className="text-xl font-bold text-gray-800 mb-2">No answers yet</h3><p className="text-gray-500">Be the first to help!</p></div>
        )}
      </motion.div>
    </div>
  </div><Footer /></>);
}