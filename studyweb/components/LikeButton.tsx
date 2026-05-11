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
      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-semibold ${
        liked
          ? "text-purple-700"
          : "text-purple-500 hover:text-purple-700"
      }`}
      style={liked 
        ? { boxShadow: 'inset 3px 3px 6px #a3b1c6, inset -3px -3px 6px #ffffff', background: '#e0e5ec' }
        : { boxShadow: '3px 3px 6px #a3b1c6, -3px -3px 6px #ffffff', background: '#e0e5ec' }
      }
    >
      <ThumbsUp size={16} fill={liked ? "currentColor" : "none"} />
      <span>{liked ? "Liked" : "Like"}</span>
    </button>
  );
}
