"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Mail, Lock, Eye, EyeOff, User, ShieldCheck, Sparkles, BarChart3, Target, ArrowRight, X, AlertTriangle, Settings } from "lucide-react";

import { register, socialLogin } from "@/services/api/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Social Login States
  const [socialProvider, setSocialProvider] = useState<"google" | "apple" | null>(null);
  const [socialEmail, setSocialEmail] = useState("");
  const [socialName, setSocialName] = useState("");
  const [socialLoading, setSocialLoading] = useState(false);
  const [socialError, setSocialError] = useState("");
  const [showConfigModal, setShowConfigModal] = useState(false);

  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  // Check URL hash for direct Google OAuth redirect response
  useEffect(() => {
    const handleGoogleRedirectHash = async () => {
      if (typeof window === "undefined") return;

      const hash = window.location.hash;
      if (!hash) return;

      const params = new URLSearchParams(hash.substring(1));
      const idToken = params.get("id_token");

      if (idToken) {
        // Clear hash from address bar immediately
        window.history.replaceState(null, "", window.location.pathname);
        
        setSocialLoading(true);
        setSocialError("");
        try {
          const data = await socialLogin(
            "", // Backend extracts verified email from token
            "", // Backend extracts verified name from token
            "google",
            idToken
          );
          localStorage.setItem("token", data.access_token);
          router.push("/dashboard");
        } catch (err) {
          const detail = axios.isAxiosError(err)
            ? err.response?.data?.detail
            : null;
          setSocialError(
            typeof detail === "string"
              ? detail
              : "Google redirect authentication failed. Try again."
          );
        } finally {
          setSocialLoading(false);
        }
      }
    };

    handleGoogleRedirectHash();
  }, [router]);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "Empty", color: "bg-slate-700" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[@$!%*#?&]/.test(pass)) score += 1;

    const finalScore = Math.min(score, 4);
    if (finalScore <= 1) return { score: 1, label: "Weak", color: "bg-rose-500" };
    if (finalScore === 2) return { score: 2, label: "Medium", color: "bg-amber-500" };
    if (finalScore === 3) return { score: 3, label: "Strong", color: "bg-teal-400" };
    return { score: 4, label: "Strong", color: "bg-violet-500" };
  };

  const strength = getPasswordStrength(password);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!agreeTerms) {
      setError("You must agree to the Terms & Privacy Policy");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await register(fullName, email.trim().toLowerCase(), password);
      localStorage.setItem("pending_verify_email", data.email);
      if (data.dev_otp) {
        localStorage.setItem("pending_verify_otp", data.dev_otp);
      } else {
        localStorage.removeItem("pending_verify_otp");
      }
      router.push("/verify-otp");
    } catch (err) {
      const detail = axios.isAxiosError(err)
        ? err.response?.data?.detail
        : null;
      setError(
        typeof detail === "string"
          ? detail
          : "Could not create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleClick = () => {
    if (!GOOGLE_CLIENT_ID) {
      setShowConfigModal(true);
    } else {
      // Direct Google Redirect OAuth Flow (directing back to /register)
      const redirectUri = `${window.location.origin}/register`;
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=id_token&scope=openid%20email%20profile&nonce=journalx_nonce`;
      window.location.href = googleAuthUrl;
    }
  };

  const handleSocialClick = (provider: "google" | "apple") => {
    setSocialProvider(provider);
    setSocialEmail(provider === "google" ? "trader.demo@gmail.com" : "trader.demo@apple.com");
    setSocialName("Demo Trader");
    setSocialError("");
  };

  const handleSocialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialEmail.trim()) {
      setSocialError("Please enter an email address");
      return;
    }

    setSocialLoading(true);
    setSocialError("");

    try {
      const data = await socialLogin(
        socialEmail.trim().toLowerCase(),
        socialName.trim() || "Social User",
        socialProvider || "google",
        "mock_oauth_token"
      );
      localStorage.setItem("token", data.access_token);
      router.push("/dashboard");
    } catch (err) {
      setSocialError("OAuth signup failed. Try again.");
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#02060d] text-white flex items-center justify-center p-4 sm:p-6 md:p-10 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(124,58,237,0.12),transparent_35%),radial-gradient(circle_at_72%_70%,rgba(20,184,166,0.08),transparent_40%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:60px_60px] opacity-30" />

      {/* Main Container Card */}
      <div className="relative w-full max-w-[1140px] grid rounded-[2.5rem] border border-white/10 bg-[#070b15]/75 backdrop-blur-xl shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden lg:grid-cols-[1.05fr_0.95fr] z-10">
        
        {/* Left Pitch Panel */}
        <section className="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#0a0f1d] via-[#050811] to-[#0c1224] border-r border-white/5 overflow-hidden">
          {/* Subtle glow behind visual card */}
          <div className="absolute left-[50%] top-[40%] -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

          {/* Top Header */}
          <div className="flex items-center gap-3.5 z-10">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-[0_0_20px_rgba(45,212,191,0.15)]">
              <Image
                src="/brand/journalfx-logo.png"
                alt="JournalFX"
                width={36}
                height={36}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight [font-family:Georgia,serif]">
                JournalFX
              </span>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-none mt-0.5">
                Track. Analyze. Improve.
              </p>
            </div>
          </div>

          {/* Main Visuals & Badges */}
          <div className="space-y-8 my-auto pt-8 z-10">
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-300">
                  ALL-IN-ONE TRADING JOURNAL
                </span>
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
                Start journaling <br />
                trades <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent">better</span>
              </h2>
              <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
                Create your account and unlock trade review, analytics, risk tracking, and funded account management.
              </p>
            </div>

            {/* Glowing 3D-styled Win Rate & Profit Factor Card */}
            <div className="rounded-2xl border border-white/10 bg-[#0b1122]/60 p-5 shadow-[0_15px_35px_rgba(0,0,0,0.3)] backdrop-blur-md max-w-sm">
              <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-4 mb-4">
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Win Rate</p>
                  <p className="text-xl font-extrabold text-teal-300 mt-0.5">71.43%</p>
                </div>
                <div className="border-l border-white/5 pl-4">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Profit Factor</p>
                  <p className="text-xl font-extrabold text-violet-400 mt-0.5">1.89</p>
                </div>
              </div>

              {/* Custom SVG bars and line chart visual */}
              <div className="h-20 w-full flex items-end gap-3.5 px-2">
                {[45, 60, 30, 80, 50, 95, 75].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col justify-end h-full">
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        idx === 5
                          ? "bg-gradient-to-t from-violet-600 to-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                          : "bg-white/10"
                      }`}
                      style={{ height: `${val}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* List of Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-violet-300">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Advanced Trade Analytics</h4>
                  <p className="text-[10px] text-slate-500">Understand your performance deeply</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-cyan-300">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">AI-Powered Insights</h4>
                  <p className="text-[10px] text-slate-500">Get smart feedback to improve faster</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-teal-300">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Risk & Funded Account Tracking</h4>
                  <p className="text-[10px] text-slate-500">Stay in control. Protect your capital.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof (Avatar row + Stars) */}
          <div className="flex items-center gap-4 mt-8 z-10">
            <div className="flex -space-x-3.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full border-2 border-[#090f1d] bg-slate-800 flex items-center justify-center text-[10px] font-bold text-teal-200"
                >
                  U{i}
                </div>
              ))}
            </div>
            <div>
              <div className="flex text-amber-400 gap-0.5">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <span key={idx}>★</span>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Loved by 10,000+ traders worldwide</p>
            </div>
          </div>

          {/* Bottom Footer text */}
          <p className="text-[10px] text-slate-500 mt-6 z-10">
            Built for traders. Designed for results.
          </p>
        </section>

        {/* Right Form Panel */}
        <section className="p-8 sm:p-12 md:p-16 flex flex-col justify-center bg-[#070b15] relative">
          
          {/* Form Header */}
          <div className="mb-8">
            <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">
              Create your account
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Sign up for JournalFX
            </h2>
            <p className="mt-1.5 text-xs text-slate-500">
              Fill in your details to get started.
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Full Name Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full pl-11 pr-4 py-3 bg-white/[0.02] border border-white/10 rounded-2xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-400/40 transition"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            {/* Email Address Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                autoCapitalize="none"
                autoComplete="email"
                className="w-full pl-11 pr-4 py-3 bg-white/[0.02] border border-white/10 rounded-2xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-400/40 transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full pl-11 pr-10 py-3 bg-white/[0.02] border border-white/10 rounded-2xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-400/40 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Confirm Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="w-full pl-11 pr-10 py-3 bg-white/[0.02] border border-white/10 rounded-2xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-400/40 transition"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Password strength:</span>
                  <span className={`font-bold uppercase tracking-wider ${
                    strength.label === "Weak"
                      ? "text-rose-400"
                      : strength.label === "Medium"
                      ? "text-amber-400"
                      : "text-teal-400"
                  }`}>
                    {strength.label}
                  </span>
                </div>
                <div className="flex gap-1.5 h-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-all duration-300 ${
                        i <= strength.score ? strength.color : "bg-white/5"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Agree Terms Checkbox */}
            <div className="flex items-start text-xs pt-1">
              <label className="flex items-start gap-2.5 text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-white/15 bg-white/[0.02] text-violet-500 focus:ring-violet-500/20 h-4 w-4 mt-0.5 transition"
                />
                <span className="leading-5">
                  I agree to the{" "}
                  <a href="#" className="text-violet-400 hover:text-violet-300 font-medium">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="text-violet-400 hover:text-violet-300 font-medium">Privacy Policy</a>.
                </span>
              </label>
            </div>

            {/* Error/Feedback Message */}
            {error && (
              <p className="text-xs text-rose-400 pt-1 font-medium">{error}</p>
            )}
            {socialError && (
              <p className="text-xs text-rose-400 pt-1 font-medium">{socialError}</p>
            )}
            {socialLoading && (
              <p className="text-xs text-teal-400 pt-1 font-medium animate-pulse">Redirecting &amp; authenticating with Google...</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || socialLoading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 py-3.5 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/15 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70 mt-2"
            >
              <span>{loading ? "Creating account..." : "Create Account"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Social Logins */}
          <div className="mt-8 space-y-6">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-x-0 border-t border-white/5" />
              <span className="relative bg-[#070b15] px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                or continue with
              </span>
            </div>

            {/* Google / Apple Buttons Grid */}
            <div className="grid grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={socialLoading}
                className="flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 bg-white/[0.01] hover:bg-white/[0.03] py-3 rounded-2xl text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5.04c1.62 0 3.08.56 4.22 1.66l3.15-3.15C17.45 1.73 14.93 1 12 1 7.35 1 3.39 3.65 1.5 7.5l3.78 2.93C6.17 6.96 8.87 5.04 12 5.04z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.39-4.88 3.39-8.54z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.92c-.24-.72-.38-1.5-.38-2.3s.14-1.58.38-2.3L1.5 7.39c-.83 1.66-1.3 3.52-1.3 5.49s.47 3.83 1.3 5.49l3.78-2.95z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.3 1.09-4.3 1.09-3.13 0-5.83-1.92-6.78-4.81L1.44 16.48C3.33 20.31 7.3 23 12 23z"
                  />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialClick("apple")}
                disabled={socialLoading}
                className="flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 bg-white/[0.01] hover:bg-white/[0.03] py-3 rounded-2xl text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              >
                <svg className="h-4 w-4 shrink-0 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.23.67-2.95 1.51-.64.73-1.2 1.87-1.05 2.97 1.1.09 2.25-.57 3.01-1.42z" />
                </svg>
                <span>Apple</span>
              </button>
            </div>
          </div>

          {/* Footer Navigation link */}
          <p className="mt-8 text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium transition">
              Login
            </Link>
          </p>

        </section>
      </div>

      {/* GCP Google Configuration Instruction Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4">
          <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0c1224] p-6 shadow-2xl space-y-5">
            <button
              onClick={() => setShowConfigModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="flex items-center gap-3 text-amber-400 border-b border-white/5 pb-3">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h3 className="text-base font-bold">Google Client ID Not Configured</h3>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed">
              <p>
                To enable real direct Google Sign-up, you must configure a Google Client ID in your local environment. Follow these steps:
              </p>
              <ol className="list-decimal pl-4 space-y-1.5">
                <li>Go to the Google Cloud Console and select/create a project.</li>
                <li>Go to APIs &amp; Services &gt; Credentials and create an OAuth 2.0 Client ID (Web application).</li>
                <li>Add both of the following to **Authorized redirect URIs**:
                  <pre className="mt-1 bg-black/45 border border-white/5 rounded-lg p-2 text-slate-400 font-mono text-[9px]">
                    http://localhost:3000/login<br />
                    http://localhost:3000/register
                  </pre>
                </li>
                <li>Copy the Client ID and add it to your `frontend/.env.local` file:
                  <pre className="mt-1 bg-black/45 border border-white/5 rounded-lg p-2 text-violet-300 font-mono text-[10px] select-all">
                    NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_id_here.apps.googleusercontent.com
                  </pre>
                </li>
                <li>Restart your frontend server (npm run dev).</li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => {
                  setShowConfigModal(false);
                  handleSocialClick("google");
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs rounded-xl transition shadow-lg shadow-violet-600/25 cursor-pointer"
              >
                <Settings className="h-3.5 w-3.5" />
                <span>Use Sandbox Account</span>
              </button>
              <button
                onClick={() => setShowConfigModal(false)}
                className="flex-1 py-3 border border-white/10 hover:bg-white/5 text-slate-300 font-semibold text-xs rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mock Social Sign-In Modal */}
      {socialProvider && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#0c1224] p-6 shadow-2xl space-y-6">
            <button
              onClick={() => setSocialProvider(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="text-center space-y-2">
              <div className="flex justify-center">
                {socialProvider === "google" ? (
                  <svg className="h-10 w-10" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5.04c1.62 0 3.08.56 4.22 1.66l3.15-3.15C17.45 1.73 14.93 1 12 1 7.35 1 3.39 3.65 1.5 7.5l3.78 2.93C6.17 6.96 8.87 5.04 12 5.04z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.39-4.88 3.39-8.54z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.92c-.24-.72-.38-1.5-.38-2.3s.14-1.58.38-2.3L1.5 7.39c-.83 1.66-1.3 3.52-1.3 5.49s.47 3.83 1.3 5.49l3.78-2.95z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.3 1.09-4.3 1.09-3.13 0-5.83-1.92-6.78-4.81L1.44 16.48C3.33 20.31 7.3 23 12 23z"
                    />
                  </svg>
                ) : (
                  <svg className="h-10 w-10 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.23.67-2.95 1.51-.64.73-1.2 1.87-1.05 2.97 1.1.09 2.25-.57 3.01-1.42z" />
                  </svg>
                )}
              </div>
              <h3 className="text-lg font-bold">
                Continue with {socialProvider === "google" ? "Google" : "Apple"}
              </h3>
              <p className="text-xs text-slate-500">
                Sign in securely via {socialProvider === "google" ? "Google Accounts" : "Apple ID"} proxy.
              </p>
            </div>

            <form onSubmit={handleSocialSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  Account Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-3 bg-white/[0.02] border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-violet-500/40"
                  value={socialName}
                  onChange={(e) => setSocialName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. name@domain.com"
                  className="w-full px-4 py-3 bg-white/[0.02] border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-violet-500/40"
                  value={socialEmail}
                  onChange={(e) => setSocialEmail(e.target.value)}
                  required
                />
              </div>

              {socialError && (
                <p className="text-xs text-rose-400 font-medium">{socialError}</p>
              )}

              <button
                type="submit"
                disabled={socialLoading}
                className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-800 disabled:cursor-not-allowed font-semibold text-xs rounded-2xl transition shadow-lg shadow-violet-600/20"
              >
                {socialLoading ? "Authenticating..." : "Continue"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
