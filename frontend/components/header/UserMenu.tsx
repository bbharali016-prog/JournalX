"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChevronDown, User, LogOut, CreditCard, Sparkles, X } from "lucide-react";
import { useCurrentUser } from "@/components/auth/UserContext";
import { getBackendUrl } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function UserMenu() {
  const { user } = useCurrentUser();
  const router = useRouter();
  const [showMyPlan, setShowMyPlan] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  const displayName = user?.full_name ?? "Trader";
  const initials =
    user?.full_name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") ?? "JX";

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const backendUrl = getBackendUrl();
  const avatarSrc = user?.profile_image_url
    ? (user.profile_image_url.startsWith("http")
        ? user.profile_image_url
        : (backendUrl.endsWith("/") ? backendUrl.slice(0, -1) : backendUrl) + user.profile_image_url)
    : undefined;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left transition hover:bg-white/10 cursor-pointer outline-none">
          <Avatar className="h-10 w-10">
            {avatarSrc && <AvatarImage src={avatarSrc} alt={displayName} className="object-cover" />}
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="hidden sm:block">
            <p className="font-medium text-white text-sm">{displayName}</p>
            <p className="text-xs text-slate-400">{(user?.plan || "Free") + " Plan"}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="bg-[#0b1220] border border-white/10 text-white rounded-2xl p-1.5 min-w-[160px] shadow-2xl z-50"
        >
          <DropdownMenuItem
            onClick={() => router.push("/settings")}
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-slate-200 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-colors outline-none"
          >
            <User className="h-4 w-4 text-indigo-400" />
            View Profile
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setShowMyPlan(true)}
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-slate-200 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-colors outline-none"
          >
            <Sparkles className="h-4 w-4 text-violet-400" />
            My Plan
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-white/5 my-1" />

          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl cursor-pointer transition-colors outline-none"
          >
            <LogOut className="h-4 w-4 text-rose-400" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* My Plan Details Modal */}
      {mounted && showMyPlan && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-white/8 bg-[#0a101e] p-6 shadow-2xl relative overflow-hidden text-left">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
            
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-indigo-400 animate-pulse" />
                Subscription Plan Details
              </h3>
              <button
                onClick={() => setShowMyPlan(false)}
                className="rounded-full border border-white/10 p-1.5 text-slate-400 hover:text-white hover:bg-white/5 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Current Plan:</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    user?.plan?.toLowerCase() === "elite"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                      : user?.plan?.toLowerCase() === "pro"
                      ? "bg-violet-500/10 text-violet-400 border border-violet-500/25"
                      : "bg-white/5 text-slate-400 border border-white/5"
                  }`}>
                    {user?.plan || "Free"} Plan
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Billing Cycle:</span>
                  <span className="text-sm text-white font-medium">
                    {user?.plan && user.plan !== "Free" ? "Yearly Plan (Billed Annual)" : "N/A"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Active Status:</span>
                  <span className="text-sm text-emerald-400 font-semibold flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Active
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-4 space-y-3 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Activation Date:</span>
                  <span className="text-white font-medium">
                    {user?.plan && user.plan !== "Free" ? "August 1, 2026" : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Expiration / Renewal Date:</span>
                  <span className="text-white font-medium">
                    {user?.plan && user.plan !== "Free" ? "August 1, 2027" : "N/A"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowMyPlan(false);
                  router.push("/plans");
                }}
                className="mt-2 w-full rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:opacity-95 transition cursor-pointer"
              >
                {user?.plan === "Free" ? "Upgrade Now" : "Manage / Change Plan"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
