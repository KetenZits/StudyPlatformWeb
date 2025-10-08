"use client";
import { SignUp } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { BookOpen, Sparkles, Users, Award, Zap, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-5">
      
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#D4A574]/20 to-[#B8873D]/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#C9984E]/20 to-[#D4A574]/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Branding */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-white/50">
            {/* Logo */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4A574] via-[#C9984E] to-[#B8873D] flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-2xl">S</span>
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900">Study Platform</h1>
                <p className="text-sm text-gray-600 font-medium">Learn & Share Knowledge</p>
              </div>
            </div>

            {/* Welcome Text */}
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Join Our Community! 🚀
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Create your free account and start your learning journey today. Connect with thousands of students and experts worldwide.
            </p>

            {/* Benefits */}
            <div className="space-y-4">
              {[
                { icon: BookOpen, text: "Ask unlimited questions", gradient: "from-blue-500 to-cyan-500" },
                { icon: Users, text: "Get help from expert community", gradient: "from-purple-500 to-pink-500" },
                { icon: Award, text: "Earn coins & unlock rewards", gradient: "from-amber-500 to-orange-600" },
                { icon: Zap, text: "Track your learning progress", gradient: "from-green-500 to-emerald-500" },
                { icon: TrendingUp, text: "Build your reputation", gradient: "from-red-500 to-pink-500" },
                { icon: Sparkles, text: "100% free forever", gradient: "from-indigo-500 to-purple-500" },
              ].map((benefit, i) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    className="flex items-center gap-4"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${benefit.gradient} flex items-center justify-center shadow-md flex-shrink-0`}>
                      <Icon size={22} className="text-white" />
                    </div>
                    <span className="text-gray-700 font-semibold">{benefit.text}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* Trust Badges */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-around">
                <div className="text-center">
                  <div className="text-3xl mb-2">🎓</div>
                  <div className="text-xs text-gray-600 font-semibold">Verified Experts</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🔒</div>
                  <div className="text-xs text-gray-600 font-semibold">Secure & Private</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">⚡</div>
                  <div className="text-xs text-gray-600 font-semibold">Fast Answers</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Sign Up Form */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4A574] via-[#C9984E] to-[#B8873D] flex items-center justify-center shadow-lg mx-auto mb-4">
              <span className="text-white font-black text-2xl">S</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">Study Platform</h1>
            <p className="text-gray-600 font-medium">Create your free account</p>
          </div>

          {/* Clerk Sign Up Component with Custom Styling */}
          <div className="w-full max-w-md">
            <SignUp
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-white/80 backdrop-blur-sm shadow-2xl border border-white/50 rounded-3xl",
                  headerTitle: "text-gray-900 font-black text-2xl",
                  headerSubtitle: "text-gray-600 font-medium",
                  socialButtonsBlockButton: "bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl transition-all hover:border-gray-300",
                  socialButtonsBlockButtonText: "font-semibold",
                  formButtonPrimary: "bg-gradient-to-r from-[#D4A574] via-[#C9984E] to-[#B8873D] hover:shadow-xl transition-all font-bold rounded-xl",
                  formFieldInput: "rounded-xl border-2 border-gray-200 focus:border-[#C9984E] transition-all",
                  formFieldLabel: "text-gray-700 font-semibold",
                  footerActionLink: "text-[#C9984E] hover:text-[#B8873D] font-semibold",
                  identityPreviewText: "text-gray-700 font-medium",
                  identityPreviewEditButton: "text-[#C9984E] hover:text-[#B8873D] font-semibold",
                  formResendCodeLink: "text-[#C9984E] hover:text-[#B8873D] font-semibold",
                  otpCodeFieldInput: "border-2 border-gray-200 focus:border-[#C9984E] rounded-xl",
                  formFieldInputShowPasswordButton: "text-gray-500 hover:text-gray-700",
                  dividerLine: "bg-gray-200",
                  dividerText: "text-gray-500 font-medium",
                  footer: "hidden",
                },
              }}
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
            />
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Already have an account?{" "}
              <Link href="/sign-in" className="font-bold text-[#C9984E] hover:text-[#B8873D] transition-colors">
                Sign in here
              </Link>
            </p>
            <p className="text-xs text-gray-500 mt-4 max-w-md">
              By signing up, you agree to our{" "}
              <a href="/terms" className="text-[#C9984E] hover:underline">Terms of Service</a>
              {" "}and{" "}
              <a href="/privacy" className="text-[#C9984E] hover:underline">Privacy Policy</a>
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}