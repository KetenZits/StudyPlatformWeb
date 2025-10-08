"use client";
import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export default function ProfilePicEditor() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const uploadProfilePic = useMutation(api.users.updateProfilePic);

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);

    const formData = new FormData();
    formData.append("file", croppedImage as Blob);

    // อัปโหลดไป Next API
    const uploadRes = await fetch("/api/uploadProfilePic", {
      method: "POST",
      body: formData,
    });

    if(!uploadRes.ok){
      console.log("Error upload")
    }

    // เช็คว่ามี body ก่อน
    const text = await uploadRes.text();
    let storageId;
    try {
      storageId = text ? JSON.parse(text).storageId : null;
    } catch (e) {
      console.error("Invalid JSON response:", text);
      return;
    }

    if (!storageId) return;

    // ส่ง storageId ให้ Convex บันทึกเป็น URL
    const result = await uploadProfilePic({ storageId });
    console.log("✅ Uploaded:", result.url);

    alert("Profile picture updated!");
    setImageSrc(null);
  };

  return (
    <div>
      {!imageSrc ? (
        <input type="file" accept="image/*" onChange={handleFileChange} />
      ) : (
        <div style={{ position: "relative", width: 300, height: 300 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
      )}

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        {imageSrc && <button onClick={handleSave}>Save</button>}
        {imageSrc && <button onClick={() => setImageSrc(null)}>Cancel</button>}
      </div>
    </div>
  );
}
