"use client";
import { SignIn } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { BookOpen, Sparkles, Users, Award } from "lucide-react";
import Link from "next/link";
import { api } from "../../../../convex/_generated/api";
import { useQuery } from "convex/react";

export default function SignInPage() {

  const totalUser = useQuery(api.users.getTotalUsers)
  const totalPosts = useQuery(api.posts.getTotalPosts)
  console.log(totalUser);
  console.log(totalPosts);


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
              Welcome Back! 👋
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Sign in to continue your learning journey and connect with our community of learners and experts.
            </p>

            {/* Features */}
            <div className="space-y-4">
              {[
                { icon: BookOpen, text: "Access thousands of questions", gradient: "from-blue-500 to-cyan-500" },
                { icon: Users, text: "Connect with learners worldwide", gradient: "from-purple-500 to-pink-500" },
                { icon: Award, text: "Earn coins and achievements", gradient: "from-amber-500 to-orange-600" },
                { icon: Sparkles, text: "Get personalized help", gradient: "from-green-500 to-emerald-500" },
              ].map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center shadow-md`}>
                      <Icon size={22} className="text-white" />
                    </div>
                    <span className="text-gray-700 font-semibold">{feature.text}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-10 pt-8 border-t border-gray-200">
              {[
                { value: totalUser, label: "Students" },
                { value: totalPosts, label: "Questions" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-black bg-gradient-to-r from-[#D4A574] via-[#C9984E] to-[#B8873D] bg-clip-text text-transparent">
                    {stat.value}+
                  </div>
                  <div className="text-xs text-gray-600 font-semibold mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Side - Sign In Form */}
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
            <p className="text-gray-600 font-medium">Sign in to continue</p>
          </div>

          {/* Clerk Sign In Component with Custom Styling */}
          <div className="w-full max-w-md">
            <SignIn
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
              path="/sign-in"
              signUpUrl="/sign-up"
            />
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="font-bold text-[#C9984E] hover:text-[#B8873D] transition-colors">
                Sign up for free
              </Link>
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}