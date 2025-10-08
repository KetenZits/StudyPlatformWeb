"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import ProfilePicEditor from "../../../../components/ProfilePicEditor";

export default function EditProfilePage() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const updateProfile = useMutation(api.users.updateProfile);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const updateProfilePic = useMutation(api.users.updateProfilePic);

  const [name, setName] = useState(currentUser?.name || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ name, bio });
      setStatus("✅ Profile updated successfully!");
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to update profile");
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 1. ขอ URL สำหรับอัปโหลด
      const postUrl = await generateUploadUrl();

      // 2. อัปโหลดไฟล์ไปที่ Convex
      const res = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const { storageId } = await res.json();

      // 3. อัปเดต user ให้ใช้รูปใหม่นี้
      const result = await updateProfilePic({ storageId });
      setStatus(`✅ Uploaded successfully!`);
    } catch (err) {
      console.error(err);
      setStatus("❌ Upload failed");
    }
  };

  if (!currentUser) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: "500px", margin: "50px auto" }}>
      <h1>Edit Profile</h1>
        <ProfilePicEditor/>
      {currentUser.profilePic && (
        <div style={{ marginBottom: "10px" }}>
          <img
            src={currentUser.profilePic}
            alt="Profile"
            width={100}
            height={100}
            style={{ borderRadius: "50%" }}
          />
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>Name:</label><br />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Bio:</label><br />
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Profile Picture:</label><br />
          <input type="file" accept="image/*" onChange={handleUpload} />
        </div>

        <button type="submit" style={{ padding: "8px 16px" }}>
          Save
        </button>
      </form>

      {status && <p style={{ marginTop: "10px" }}>{status}</p>}
    </div>
  );
}
