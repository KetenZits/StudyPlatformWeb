"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect,useState } from "react";
import Navbar from '../../../components/Navbar'

export default function ProfilePage() {
  const { user } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);
  const createUser = useMutation(api.users.createUser);
  const [created, setCreated] = useState(false);

  // hook ต้องอยู่นอก if เสมอ
  useEffect(() => {
    if (user && currentUser === null && !created) {
      createUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "unknown",
        name: user.firstName || "NoName",
        profilePic: user.imageUrl,
        coins: 0,
        answerStreak: 0,
        bestStreak: 0,
        role: "user",
        banned: false,
        createdAt: Date.now(),
      }).then(() => setCreated(true));
    }
  }, [user, currentUser, createUser, created]);

  if (!user) return <p>Please login</p>;
  if (currentUser === undefined) return <p>Loading...</p>;
  if (currentUser === null) return <p>Creating profile...</p>;

  return (
    <div>
      <Navbar/>
      <div className="mt-25">
        <h1>Welcome {currentUser.name}</h1>
        <p>Email: {currentUser.email}</p>
        <p>Coins: {currentUser.coins}</p>
        <p>Role: {currentUser.role}</p>
      </div>
    </div>
  );
}
