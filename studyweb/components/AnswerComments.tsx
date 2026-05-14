"use client";
import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { motion } from "framer-motion";
import { Send, Trash2, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useToast } from "./Toast";

interface AnswerCommentsProps {
  answerId: Id<"answers">;
  currentUser: any;
}

export default function AnswerComments({ answerId, currentUser }: AnswerCommentsProps) {
  const comments = useQuery(api.comments.getCommentsByAnswerId, { answerId });
  const createComment = useMutation(api.comments.createComment);
  const deleteComment = useMutation(api.comments.deleteComment);
  const toast = useToast();

  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser) return;
    setIsSubmitting(true);
    try {
      await createComment({ answerId, body: commentText.trim() });
      setCommentText("");
    } catch (err) {
      toast.error("Error", (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: Id<"answerComments">) => {
    try {
      await deleteComment({ commentId });
    } catch (err) {
      toast.error("Error", (err as Error).message);
    }
  };

  const getInitials = (name: string) => name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  if (comments === undefined) return null; // loading

  const isAdmin = currentUser && (currentUser.role === "admin" || currentUser.role === "Admin" || currentUser.role === "developer" || currentUser.role === "Developer");

  return (
    <div className="mt-4 pt-4 border-t border-gray-300/40">
      <button 
        onClick={() => setShowComments(!showComments)}
        className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-purple-600 transition-colors mb-3"
      >
        <MessageCircle size={16} />
        {comments.length} {comments.length === 1 ? "Reply" : "Replies"}
      </button>

      {showComments && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden space-y-4 pl-4 sm:pl-8 border-l-2 border-purple-200">
          {/* Comments List */}
          {comments.map((comment) => {
            const isOwner = currentUser?._id === comment.userId;
            return (
              <div key={comment._id} className="flex gap-3 items-start group">
                <Link href={`/profile/${comment.userId}`} className="shrink-0">
                  <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-gray-200" style={{ boxShadow: "inset 2px 2px 4px var(--nm-shadow-dark), inset -2px -2px 4px var(--nm-shadow-light)" }}>
                    {comment.author.profilePic ? (
                      <img src={comment.author.profilePic} alt={comment.author.name || "User"} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-gray-500">{getInitials(comment.author.name || "User")}</span>
                    )}
                  </div>
                </Link>
                <div className="flex-1 min-w-0 nm-flat p-3 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <Link href={`/profile/${comment.userId}`}>
                      <span className="font-bold text-sm text-gray-800 hover:text-purple-600 transition-colors">{comment.author.name || "Anonymous"}</span>
                    </Link>
                    <span className="text-[10px] text-gray-400 font-medium">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{comment.body}</p>
                </div>
                {(isOwner || isAdmin) && (
                  <button onClick={() => handleDelete(comment._id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })}

          {/* Comment Form */}
          {currentUser && (
            <form onSubmit={handleSubmit} className="flex gap-2 items-end pt-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a reply..."
                  className="w-full nm-input rounded-xl text-sm px-4 py-2"
                  disabled={isSubmitting}
                />
              </div>
              <button 
                type="submit" 
                disabled={!commentText.trim() || isSubmitting}
                className={`p-2 rounded-xl transition-all flex items-center justify-center shrink-0 ${!commentText.trim() || isSubmitting ? "nm-btn text-gray-400" : "nm-gradient-btn"}`}
              >
                <Send size={16} />
              </button>
            </form>
          )}
        </motion.div>
      )}
    </div>
  );
}
