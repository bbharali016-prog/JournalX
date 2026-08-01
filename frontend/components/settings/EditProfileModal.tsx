"use client";

import { useState, useRef, useEffect } from "react";
import { X, Camera, Loader2 } from "lucide-react";
import { useCurrentUser } from "@/components/auth/UserContext";
import { updateProfile, uploadAvatar } from "@/services/api/users";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, refreshUser } = useCurrentUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user && isOpen) {
      setFullName(user.full_name || "");
      setEmail(user.email || "");
      setImageUrl(user.profile_image_url || "");

      setError("");
      setSuccess("");
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authorization token");

      const response = await uploadAvatar(token, file);
      setImageUrl(response.url);
      setSuccess("Profile picture uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setError("Name and Email are required fields.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authorization token");

      await updateProfile(token, {
        full_name: fullName,
        email: email,
        profile_image_url: imageUrl,
      });

      await refreshUser();
      setSuccess("Profile updated successfully!");
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const initials =
    fullName
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") ?? "JX";

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const avatarSrc = imageUrl
    ? (imageUrl.startsWith("http")
        ? imageUrl
        : (backendUrl.endsWith("/") ? backendUrl.slice(0, -1) : backendUrl) + imageUrl)
    : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0b1220] p-6 shadow-2xl transition-all duration-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl border border-white/5 bg-white/5 p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-white">Edit Profile</h2>
          <p className="mt-1 text-sm text-slate-400">Update your name, email and profile picture.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-rose-500/10 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-2xl border border-emerald-500/10 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            {success}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="group relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar className="h-24 w-24 border-2 border-white/10 transition group-hover:opacity-75">
                {avatarSrc && <AvatarImage src={avatarSrc} alt={fullName} className="object-cover" />}
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-3xl font-semibold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {/* Upload Overlay */}
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                {uploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Change photo"}
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Full Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Bitupan Bharali"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder-slate-500 transition-colors focus:border-violet-500 focus:outline-none"
            />
          </div>

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@domain.com"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder-slate-500 transition-colors focus:border-violet-500 focus:outline-none"
            />
          </div>

          {/* Subscription Plan – Read-only display */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Plan</label>
            <div className="flex items-center gap-3 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                  (user?.plan?.toLowerCase() === "elite")
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : (user?.plan?.toLowerCase() === "pro")
                    ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                    : "bg-white/5 text-slate-400 border border-white/10"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${
                  (user?.plan?.toLowerCase() === "elite" || user?.plan?.toLowerCase() === "pro")
                    ? "bg-emerald-400 animate-pulse"
                    : "bg-slate-500"
                }`} />
                {user?.plan
                  ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1).toLowerCase() + " Plan"
                  : "Free Plan"}
              </span>
              <span className="text-xs text-slate-500 ml-auto">Manage via Plans page</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:opacity-95 disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
