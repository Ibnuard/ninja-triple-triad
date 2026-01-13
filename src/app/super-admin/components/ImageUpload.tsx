"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "../../../lib/utils";

interface ImageUploadProps {
  onUploadSuccess: (url: string) => void;
  className?: string;
}

export function ImageUpload({ onUploadSuccess, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const cloudinaryUploadPreset =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
      setError("Cloudinary credentials missing in .env");
      return;
    }

    // Basic validation
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setError("File too large (max 5MB)");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      setFileName(file.name);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", cloudinaryUploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        onUploadSuccess(data.secure_url);
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Something went wrong during upload");
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setFileName(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative group border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer transition-all duration-300",
          isUploading
            ? "bg-white/5 border-white/10 pointer-events-none"
            : "hover:bg-white/5 hover:border-red-500/50 border-white/10",
          error ? "border-red-500/50" : "border-white/10"
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-red-500">
              Uploading Aset...
            </p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 text-gray-400 group-hover:text-red-500" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-white">
              {fileName || "Click to Upload Ninja Image"}
            </p>
            <p className="text-[9px] text-gray-600 mt-1 uppercase italic">
              PNG, JPG or WebP (Max 5MB)
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase italic bg-red-500/10 p-3 rounded-xl border border-red-500/20">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}
