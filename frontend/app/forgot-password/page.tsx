"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { forgotPassword } from "@/services/api/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await forgotPassword(email.trim().toLowerCase());
      localStorage.setItem("pending_reset_email", data.email);
      if (data.dev_otp) {
        localStorage.setItem("pending_reset_otp", data.dev_otp);
      } else {
        localStorage.removeItem("pending_reset_otp");
      }
      router.push("/reset-password");
    } catch {
      setError("No account found with this email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050b18] px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center justify-center">
        <section className="w-full rounded-[2rem] border border-white/8 bg-white/[0.03] p-8 shadow-2xl shadow-black/30 lg:p-10">
          <p className="text-sm text-slate-400">Password recovery</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Forgot password?
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Enter your email and we&apos;ll send a reset OTP.
          </p>

          <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
            <input
              type="email"
              placeholder="Email"
              autoComplete="email"
              className="w-full rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-violet-400/40"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {error && <p className="text-sm text-rose-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-3 font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-400">
            Remember password?{" "}
            <Link href="/login" className="text-violet-300 hover:text-violet-200">
              Login
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
