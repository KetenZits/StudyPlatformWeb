"use client";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MessageSquareText, Award, Send, User, Loader2, ThumbsUp, CheckCircle } from "lucide-react";
import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "../../../../convex/_generated/dataModel";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import MarkAsBestButton from "../../../../components/MarkAsBestButton";
import LikeButton from "../../../../components/LikeButton";

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.id as Id<"posts">;
  
  const post = useQuery(api.posts.getPostById, { postId });
  const answers = useQuery(api.answers.getAnswersByPostId, { postId });
  const currentUser = useQuery(api.users.getCurrentUser);
  const createAnswer = useMutation(api.answers.createAnswer);
  const markAsBest = useMutation(api.answers.markAsBestAnswer);

  const [answerText, setAnswerText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);


  // Handle submit answer
  const handleSubmitAnswer = async () => {
    if (!answerText.trim() || !currentUser) return;

    setIsSubmitting(true);
    try {
      await createAnswer({
        postId,
        body: answerText,
      });
      setAnswerText("");
      alert("Answer posted successfully!");
    } catch (error) {
      console.error("Error posting answer:", error);
      alert("Failed to post answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get initials
  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || "U";
  };

  // Loading state
  if (post === undefined || answers === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-orange-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h2>
          <Link href="/posts">
            <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold">
              Back to Posts
            </button>
          </Link>
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

      <div className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 pt-24 md:pt-28 pb-16">
        
        {/* Back Button */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="mb-6"
        >
          <Link href="/posts">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 hover:bg-white border border-white/50 shadow-md hover:shadow-lg transition-all text-gray-700 font-semibold">
              <ArrowLeft size={18} />
              <span>Back to Posts</span>
            </button>
          </Link>
        </motion.div>

        {/* Main Post Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 sm:p-8 mb-8"
        >
          {/* Post Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0">
                {post.author?.profilePic ? (
                  <img src={post.author.profilePic} alt={post.author.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-black text-xl">{getInitials(post.author?.name || "User")}</span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{post.author?.name || "Anonymous"}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <Calendar size={14} />
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 shadow-md">
              <span className="text-sm font-bold text-white">
                📚 {post.category}
              </span>
            </div>
          </div>

          {/* Post Title */}
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Post Body */}
          <p className="text-gray-700 text-lg leading-relaxed mb-6 whitespace-pre-wrap">
            {post.body}
          </p>

          {/* Post Image */}
          {post.imageUrl && (
            <div className="mb-6">
              <img
                src={post.imageUrl}
                alt="Post"
                className="w-full rounded-2xl shadow-lg max-h-96 object-contain bg-gray-50"
              />
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl">
              <MessageSquareText size={18} className="text-blue-600" />
              <span className="text-sm font-bold text-blue-600">
                {answers?.length || 0} Answers
              </span>
            </div>
          </div>
        </motion.div>

        {/* Answer Form */}
        {currentUser && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 sm:p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Answer</h2>
            
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Share your knowledge and help others learn..."
              rows={6}
              className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-all text-gray-900 placeholder-gray-400 resize-none mb-4"
            />

            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmitAnswer}
                disabled={!answerText.trim() || isSubmitting}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg transition-all ${
                  !answerText.trim() || isSubmitting
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-xl text-white"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Post Answer</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Answers Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Answers ({answers?.length || 0})
          </h2>

          {answers && answers.length > 0 ? (
            <div className="space-y-4">
              {answers.map((answer, i) => (
                <motion.div
                  key={answer._id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border p-6 ${
                    answer._id === post.bestAnswerId
                      ? "border-green-400 ring-2 ring-green-200"
                      : "border-white/50"
                  }`}
                >
                  {/* Best Answer Badge */}
                  {answer._id === post.bestAnswerId && (
                    <div className="flex items-center gap-2 mb-4 text-green-600">
                      <Award size={20} />
                      <span className="font-bold text-sm">Best Answer</span>
                    </div>
                  )}

                  {/* Answer Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md overflow-hidden flex-shrink-0">
                        {answer.author?.profilePic ? (
                          <img src={answer.author.profilePic} alt={answer.author.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white font-bold text-sm">{getInitials(answer.author?.name || "User")}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{answer.author?.name || "Anonymous"}</h4>
                        <p className="text-xs text-gray-500">
                          {new Date(answer.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg">
                      <ThumbsUp size={14} className="text-purple-600" />
                      <span className="text-sm font-bold text-purple-600">
                        {answer.likes?.length || 0}
                      </span>
                    </div>
                  </div>

                  {/* Answer Body */}
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {answer.body}
                  </p>

                  {/* Answer Actions */}
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                    <LikeButton answer={answer} currentUser={currentUser} />
                    
                    {currentUser?._id === post.userId && answer._id !== post.bestAnswerId && (
                      <MarkAsBestButton
                        post={post}
                        answer={answer}
                        currentUser={currentUser}
                      />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white/80 rounded-2xl p-12 text-center border border-white/50">
              <div className="text-6xl mb-4">💭</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No answers yet</h3>
              <p className="text-gray-600">Be the first to help by answering this question!</p>
            </div>
          )}
        </motion.div>

      </div>
    </div>
    <Footer/>
    </>
  );
}