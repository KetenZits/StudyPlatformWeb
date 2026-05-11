"use client";
import { useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export default function MarkAsBestButton({ post, answer, currentUser }: { post: any, answer: any, currentUser: any }) {
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
          className="flex items-center gap-2 px-4 py-2 rounded-xl nm-btn text-green-600 font-semibold transition-all text-sm hover:text-green-700"
        >
          <CheckCircle size={16} />
          <span>Mark as Best</span>
        </button>
      ) : (
        <button
          disabled
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-green-700 font-semibold text-sm cursor-not-allowed"
          style={{ boxShadow: 'inset 3px 3px 6px #a3b1c6, inset -3px -3px 6px #ffffff', background: '#e0e5ec' }}
        >
          <CheckCircle size={16} />
          <span>✅ Best Answer</span>
        </button>
      )}

      {/* popup ยืนยัน */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-[#e0e5ec] rounded-3xl p-6 w-[90%] max-w-sm text-center"
            style={{ boxShadow: '12px 12px 24px #a3b1c6, -12px -12px 24px #ffffff' }}
          >
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
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium transition-all text-sm"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff' }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                <span>{loading ? "Saving..." : "Confirm"}</span>
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl nm-btn text-gray-600 font-medium transition-all text-sm"
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
