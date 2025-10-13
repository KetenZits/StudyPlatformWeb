"use client";
import { useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export default function MarkAsBestButton({ post, answer, currentUser }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const markAsBestAnswer = useMutation(api.answers.markAsBestAnswer);

  // เงื่อนไขให้เฉพาะเจ้าของโพสต์กดได้
  if (currentUser?._id !== post.userId) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await markAsBestAnswer({
        postId: post._id,
        answerId: answer._id,
      });
      setShowConfirm(false);
    } catch (err) {
      console.error("Error marking best answer:", err);
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่ภายหลัง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ปุ่มหลัก */}
      {answer._id !== post.bestAnswerId ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 font-semibold transition-all text-sm"
        >
          <CheckCircle size={16} />
          <span>Mark as Best</span>
        </button>
      ) : (
        <button
          disabled
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-50 text-yellow-700 font-semibold text-sm cursor-not-allowed"
        >
          <CheckCircle size={16} />
          <span>✅ Best Answer</span>
        </button>
      )}

      {/* popup ยืนยัน */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl p-6 shadow-xl w-[90%] max-w-sm text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Confirm that this answer is the Best Answer?
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              This responder will receive 10 coins.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-all text-sm"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                <span>{loading ? "Saving..." : "Confirm"}</span>
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-all text-sm"
              >
                <XCircle size={16} />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
