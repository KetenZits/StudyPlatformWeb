import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "var(--nm-bg)" }}
    >
      <div className="text-center max-w-lg mx-auto">
        {/* 404 Number */}
        <div
          className="inline-block rounded-3xl px-10 py-8 mb-8"
          style={{
            background: "var(--nm-bg)",
            boxShadow: "12px 12px 24px var(--nm-shadow-dark), -12px -12px 24px var(--nm-shadow-light)",
          }}
        >
          <h1
            className="text-8xl sm:text-9xl font-black tracking-tighter"
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #6366f1, #3b82f6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            404
          </h1>
        </div>

        {/* Icon */}
        <div
          className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center text-4xl"
          style={{
            background: "var(--nm-bg)",
            boxShadow: "inset 4px 4px 8px var(--nm-shadow-dark), inset -4px -4px 8px var(--nm-shadow-light)",
          }}
        >
          🔍
        </div>

        {/* Title */}
        <h2
          className="text-3xl sm:text-4xl font-black mb-4"
          style={{ color: "#2d3748" }}
        >
          Page Not Found
        </h2>

        {/* Description */}
        <p
          className="text-lg mb-8 leading-relaxed"
          style={{ color: "#64748b" }}
        >
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="px-8 py-3.5 rounded-xl font-bold text-white transition-all hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #6366f1, #3b82f6)",
              boxShadow: "4px 4px 10px var(--nm-shadow-dark), -4px -4px 10px var(--nm-shadow-light)",
            }}
          >
            ← Back to Home
          </Link>
          <Link
            href="/posts"
            className="px-8 py-3.5 rounded-xl font-bold transition-all hover:-translate-y-0.5"
            style={{
              background: "var(--nm-bg)",
              boxShadow: "4px 4px 10px var(--nm-shadow-dark), -4px -4px 10px var(--nm-shadow-light)",
              color: "#475569",
            }}
          >
            Browse Posts
          </Link>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 flex items-center justify-center gap-3">
          {["📚", "🎓", "✨", "🔬", "💡"].map((emoji, i) => (
            <div
              key={i}
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
              style={{
                background: "var(--nm-bg)",
                boxShadow: "3px 3px 6px var(--nm-shadow-dark), -3px -3px 6px var(--nm-shadow-light)",
                animationDelay: `${i * 0.2}s`,
              }}
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
