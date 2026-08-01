"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { resendOtp, verifyOtp } from "@/services/api/auth";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setEmail(localStorage.getItem("pending_verify_email") ?? "");
    setDevOtp(localStorage.getItem("pending_verify_otp") ?? "");
  }, []);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await verifyOtp(email.trim().toLowerCase(), otp.trim());
      localStorage.removeItem("pending_verify_email");
      localStorage.removeItem("pending_verify_otp");
      router.push("/login");
    } catch {
      setError("Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email) {
      setError("Please enter your email first");
      return;
    }

    setResending(true);
    setError("");
    setMessage("");

    try {
      const data = await resendOtp(email.trim().toLowerCase());

      if (data.dev_otp) {
        localStorage.setItem("pending_verify_otp", data.dev_otp);
        setDevOtp(data.dev_otp);
      } else {
        localStorage.removeItem("pending_verify_otp");
        setDevOtp("");
      }

      setMessage(data.email_sent ? "OTP sent to your email" : "OTP generated. Use the dev OTP below.");
    } catch {
      setError("Could not resend OTP");
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050b18] px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center justify-center">
        <section className="w-full rounded-[2rem] border border-white/8 bg-white/[0.03] p-8 shadow-2xl shadow-black/30 lg:p-10">
          <p className="text-sm text-slate-400">Email verification</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Verify your OTP
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Enter the 6 digit OTP sent to your email.
          </p>

          {devOtp && (
            <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
              Dev OTP: <span className="font-semibold">{devOtp}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="mt-6 space-y-4">
            <input
              type="email"
              placeholder="Email"
              autoComplete="email"
              className="w-full rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-violet-400/40"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="text"
              inputMode="numeric"
              placeholder="6 digit OTP"
              className="w-full rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-violet-400/40"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />

            {error && <p className="text-sm text-rose-400">{error}</p>}
            {message && <p className="text-sm text-emerald-400">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-3 font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {resending ? "Sending again..." : "Resend OTP"}
          </button>

          <p className="mt-6 text-sm text-slate-400">
            Already verified?{" "}
            <Link href="/login" className="text-violet-300 hover:text-violet-200">
              Login
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
