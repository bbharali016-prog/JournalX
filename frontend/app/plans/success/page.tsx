"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCurrentUser } from "@/components/auth/UserContext";
import { triggerMockSuccess } from "@/services/api/stripe";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { CheckCircle2, Loader2, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useCurrentUser();

  const plan = searchParams.get("plan") || "Pro";
  const sessionId = searchParams.get("session_id") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const paymentProcessed = useRef(false);

  useEffect(() => {
    if (paymentProcessed.current) return;

    async function handlePaymentSuccess() {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User session not found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        paymentProcessed.current = true;
        setLoading(true);
        // If it is a mock session from sandbox mode, notify backend to upgrade user plan
        if (sessionId.startsWith("mock_")) {
          await triggerMockSuccess(token, plan, sessionId);
        }
        // Force refresh user profile so client context reflects new Pro/Elite plan instantly
        await refreshUser();
      } catch (err: any) {
        console.error("Error finalizing payment update:", err);
        setError(err.response?.data?.detail || "Failed to update your subscription plan.");
        paymentProcessed.current = false; // Allow retry on failure
      } finally {
        setLoading(false);
      }
    }

    if (sessionId) {
      void handlePaymentSuccess();
    } else {
      setLoading(false);
    }
  }, [sessionId, plan, refreshUser]);

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/8 bg-white/[0.03] p-8 text-center shadow-2xl shadow-black/35 relative overflow-hidden">
      
      {/* Top glowing ambient gradient */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />

      {loading ? (
        <div className="space-y-6 py-8">
          <div className="flex justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Activating subscription...</h2>
            <p className="mt-2 text-xs text-slate-400">Verifying secure checkout session with Stripe billing portal.</p>
          </div>
        </div>
      ) : error ? (
        <div className="space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
            ⚠️
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Payment Verification Failed</h2>
            <p className="mt-2 text-xs text-slate-400">{error}</p>
          </div>
          <Link
            href="/plans"
            className="mt-6 inline-flex w-full justify-center rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Back to Pricing
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Success Badge */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-emerald-500/25 blur-md animate-pulse" />
              <CheckCircle2 className="h-16 w-16 text-emerald-400 relative z-10" />
            </div>
          </div>

          {/* Congratulatory message */}
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center justify-center gap-1.5">
              <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
              Payment Successful!
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Welcome to the **{plan} Plan**. Your advanced trading tools and analysis workspaces are now unlocked!
            </p>
          </div>

          {/* Receipt styling detail box */}
          <div className="rounded-2xl border border-white/5 bg-black/45 p-4 text-left space-y-2.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Activated Plan:</span>
              <strong className="text-emerald-400">{plan} Plan</strong>
            </div>
            <div className="flex justify-between">
              <span>Subscription Status:</span>
              <span className="text-white font-medium">Active (Auto-renew)</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Gateway:</span>
              <span className="text-white font-medium">Stripe Billing Secure</span>
            </div>
            <div className="flex justify-between border-t border-white/5 pt-2.5">
              <span>Session ID:</span>
              <span className="text-slate-500 font-mono select-all truncate max-w-[200px]" title={sessionId}>
                {sessionId}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-3">
            <button
              onClick={() => router.push(plan === "Elite" ? "/backtesting" : "/dashboard")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:opacity-95 active:scale-[0.98] cursor-pointer"
            >
              {plan === "Elite" ? "Start Backtesting Sandbox" : "Go to Dashboard"}
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              href="/dashboard"
              className="block text-xs text-slate-500 transition hover:text-slate-300"
            >
              Go back to trading journal
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <DashboardLayout>
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-8">
        <Suspense
          fallback={
            <div className="w-full max-w-md rounded-3xl border border-white/8 bg-white/[0.03] p-8 text-center shadow-2xl shadow-black/35 relative">
              <div className="flex justify-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-emerald-400" />
              </div>
            </div>
          }
        >
          <CheckoutSuccessContent />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
