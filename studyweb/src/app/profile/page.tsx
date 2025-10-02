"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function ProfilePage() {
  const { user } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);
  const createUser = useMutation(api.users.createUser);

  if (!user) return <p>Please login</p>;

  if (!currentUser) {
    createUser({ name: user.firstName || "NoName" });
    return <p>Creating profile...</p>;
  }

  return (
    <div>
      <h1>Welcome {currentUser.name}</h1>
      <p>Coins: {currentUser.coins}</p>
    </div>
  );
}
