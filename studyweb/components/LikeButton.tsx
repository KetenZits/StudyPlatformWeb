"use client";
import { useState, useEffect } from "react";
import { ThumbsUp } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export default function LikeButton({ answer, currentUser }: { answer: any, currentUser: any }) {
  const toggleLike = useMutation(api.answers.toggleLikeAnswer);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(answer.likes?.length || 0);

  useEffect(() => {
    if (currentUser?._id && answer.likes?.includes(currentUser._id)) {
      setLiked(true);
    } else {
      setLiked(false);
    }
  }, [answer.likes, currentUser?._id]);

  const handleLike = async () => {
    if (!currentUser) {
      alert("กรุณาเข้าสู่ระบบก่อนกด Like");
      return;
    }

    try {
      const res = await toggleLike({ answerId: answer._id });
      if (res.liked) {
        setLiked(true);
        setLikeCount((c: number) => c + 1);
      } else {
        setLiked(false);
        setLikeCount((c: number) => c - 1);
      }
    } catch (err) {
      console.error("Error liking answer:", err);
    }
  };

  return (
    <button
      onClick={handleLike}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-semibold ${
        liked
          ? "bg-purple-100 text-purple-700"
          : "bg-purple-50 hover:bg-purple-100 text-purple-600"
      }`}
    >
      <ThumbsUp size={16} fill={liked ? "currentColor" : "none"} />
      <span>{liked ? "Liked" : "Like"}</span>
    </button>
  );
}
