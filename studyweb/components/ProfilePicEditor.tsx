import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Upload, X, Check } from "lucide-react";

// Mock getCroppedImg function - replace with your actual implementation
const getCroppedImg = async (imageSrc: string, croppedAreaPixels: any) => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => { image.onload = resolve; });
  
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;
  
  ctx?.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.95);
  });
};

interface ProfilePictureCropProps {
  currentImage?: string;
  onSave?: (imageUrl: string, storageId: string) => void;
  onCancel?: () => void;
  onImageSelect?: (imageUrl: string) => void;
}

export default function ProfilePictureCrop({ 
  currentImage, 
  onSave,
  onCancel,
  onImageSelect
}: ProfilePictureCropProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(currentImage || null);

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageSrc(result);
      // Show preview immediately
      if (onImageSelect) {
        onImageSelect(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    
    setIsUploading(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);

      const formData = new FormData();
      formData.append("file", croppedImage as Blob);

      const uploadRes = await fetch("/api/uploadProfilePic", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Upload failed");
      }

      const text = await uploadRes.text();
      let storageId;
      try {
        storageId = text ? JSON.parse(text).storageId : null;
      } catch (e) {
        console.error("Invalid JSON response:", text);
        throw new Error("Invalid response from server");
      }

      if (!storageId) throw new Error("No storage ID received");

      // Create preview URL for immediate display
      const previewUrl = URL.createObjectURL(croppedImage as Blob);
      setPreviewImage(previewUrl);
      
      if (onSave) {
        onSave(previewUrl, storageId);
      }
      
      setImageSrc(null);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    } catch (error) {
      console.error("Error uploading:", error);
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setImageSrc(null);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {!imageSrc ? (
        <div className="space-y-4">
          {/* Current Profile Picture Preview */}
          {currentImage && (
            <div className="flex justify-center mb-4">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
                <img 
                  src={currentImage} 
                  alt="Current profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Upload Button */}
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click for select</span>
              </p>
              <p className="text-xs text-gray-500">PNG, JPG or JPEG Max 5 MB.</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Cropper Container */}
          <div className="relative w-full h-80 bg-gray-900 rounded-lg overflow-hidden">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          {/* Zoom Slider */}
          <div className="px-4 py-3 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zoom
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-600"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={isUploading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isUploading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}