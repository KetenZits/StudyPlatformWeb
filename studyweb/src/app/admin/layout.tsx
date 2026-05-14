"use client";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import Sidebar from "../../../components/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);

  // Still loading authentication or user data
  if (!isLoaded || currentUser === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--nm-bg)]">
        <Loader2 className="w-16 h-16 text-purple-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Verifying access...</h2>
      </div>
    );
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[var(--nm-bg)] flex items-center justify-center">
        <div className="text-center nm-raised p-10 max-w-md mx-auto">
          <ShieldAlert className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-gray-800 mb-4 tracking-tight">Access Denied</h2>
          <p className="text-gray-500 mb-8 font-medium">You need to sign in to access the Admin Panel.</p>
          <Link href="/sign-in">
            <button className="px-8 py-3 rounded-xl nm-gradient-btn w-full">Sign In</button>
          </Link>
        </div>
      </div>
    );
  }

  // Not an admin or developer
  const isAdmin = currentUser && (
    currentUser.role === "admin" || 
    currentUser.role === "Admin" || 
    currentUser.role === "developer" || 
    currentUser.role === "Developer"
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[var(--nm-bg)] flex items-center justify-center">
        <div className="text-center nm-raised p-10 max-w-md mx-auto">
          <ShieldAlert className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-gray-800 mb-4 tracking-tight">Access Denied</h2>
          <p className="text-gray-500 mb-8 font-medium">You do not have the required permissions to view this area.</p>
          <Link href="/">
            <button className="px-8 py-3 rounded-xl nm-gradient-btn w-full">Back to Home</button>
          </Link>
        </div>
      </div>
    );
  }

  // Authorized
  return <>{children}</>;
}
