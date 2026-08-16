"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCurrentUser } from "@/components/auth/UserContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Lock, Send, FlaskConical, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";

interface ChatMessage {
  username: string;
  avatar?: string;
  message: string;
  time: string;
  plan: string;
}

const initialMessages: ChatMessage[] = [
  {
    username: "Alexander_FX",
    message: "XAU/USD is testing the weekly resistance zone at 1980. Looking for short setups.",
    time: "3 mins ago",
    plan: "Elite",
  },
  {
    username: "PipHunter_99",
    message: "EUR/USD has formed a neat double bottom on the 4H chart. Bullish continuation is likely.",
    time: "1 min ago",
    plan: "Elite",
  },
];

export default function BacktestingPage() {
  const { user } = useCurrentUser();
  const isElite = user?.plan?.toLowerCase()?.trim() === "elite";

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState("");
  const [loadingChat, setLoadingChat] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingChat(false);
    }, 850);
    return () => clearTimeout(timer);
  }, []);



  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const initials =
      user?.full_name
        ?.split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") ?? "JX";

    const newMsg: ChatMessage = {
      username: user?.full_name ?? "Trader",
      avatar: user?.profile_image_url,
      message: inputMessage,
      time: "Just now",
      plan: "Elite",
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage("");
  };

  const displayName = user?.full_name ?? "Trader";
  const initials =
    user?.full_name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") ?? "JX";

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const userAvatarSrc = user?.profile_image_url
    ? (user.profile_image_url.startsWith("http")
        ? user.profile_image_url
        : (backendUrl.endsWith("/") ? backendUrl.slice(0, -1) : backendUrl) + user.profile_image_url)
    : undefined;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Backtesting Header */}
        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-xl shadow-black/15">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-600/10 text-violet-400">
              <FlaskConical className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Tools</p>
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Backtesting Sandbox
              </h1>
            </div>
          </div>
        </div>

        {/* Backtesting Content Layout */}
        <div className="grid gap-6 xl:grid-cols-12">
          
          {/* Left Panel: TradingView Embed (70%) */}
          <div className="xl:col-span-8 rounded-3xl border border-white/8 bg-black/40 overflow-hidden min-h-[550px] shadow-2xl relative">
            <iframe
              src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=FX%3AEURUSD&interval=60&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=121212&studies=%5B%5D&theme=dark&style=1&timezone=exchange"
              style={{ width: "100%", height: "100%", border: "none", minHeight: "550px" }}
              allowFullScreen
            />
          </div>

          {/* Right Panel: TradingView Chat (30%) */}
          <div className="xl:col-span-4 rounded-3xl border border-white/8 bg-white/[0.03] flex flex-col min-h-[550px] shadow-2xl overflow-hidden relative">
            
            {/* Chat Header */}
            <div className="border-b border-white/5 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-indigo-400" />
                <span className="font-semibold text-white">TradingView Chat</span>
              </div>
              <span className="rounded-full border border-violet-400/25 bg-violet-500/10 px-2 py-0.5 text-xs font-semibold text-violet-300">
                Elite Feature
              </span>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[380px] min-h-[380px]">
              {messages.map((msg, idx) => {
                const msgInitials =
                  msg.username
                    ?.split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase())
                    .join("") ?? "JX";

                const msgAvatarSrc = msg.avatar
                  ? (msg.avatar.startsWith("http")
                      ? msg.avatar
                      : (backendUrl.endsWith("/") ? backendUrl.slice(0, -1) : backendUrl) + msg.avatar)
                  : undefined;

                return (
                  <div key={idx} className="flex items-start gap-2.5">
                    <Avatar className="h-8 w-8 rounded-lg shrink-0">
                      {msgAvatarSrc && <AvatarImage src={msgAvatarSrc} alt={msg.username} className="object-cover rounded-lg" />}
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-semibold rounded-lg text-xs">
                        {msgInitials}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-indigo-300 truncate">{msg.username}</span>
                        <span className="text-[10px] text-slate-500">{msg.time}</span>
                      </div>
                      <p className="text-sm text-slate-200 mt-1 leading-5 break-words bg-white/5 rounded-2xl px-3 py-2">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chat Send Input Form */}
            <form onSubmit={handleSendMessage} className="border-t border-white/5 p-4 flex gap-2">
              <input
                type="text"
                placeholder="Type your trading comments..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={!isElite}
                className="flex-1 rounded-xl border border-white/10 bg-[#0b1220] px-3.5 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!isElite}
                className="rounded-xl bg-violet-600 p-3 text-white transition hover:bg-violet-500 disabled:opacity-50 cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            {/* Blurred Overlay lock for Non-Elite Members */}
            {loadingChat ? (
              <div className="absolute inset-0 bg-[#060b13]/85 backdrop-blur-[4px] flex flex-col items-center justify-center p-6 text-center z-10">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                <p className="mt-4 text-sm text-slate-400">Loading chat room...</p>
              </div>
            ) : !isElite ? (
              <div className="absolute inset-0 bg-[#060b13]/85 backdrop-blur-[4px] flex flex-col items-center justify-center p-6 text-center z-10">
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-amber-400 mb-4 animate-bounce">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-300" />
                  Elite Plan Required
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-400 max-w-xs">
                  TradingView collaborative chat is restricted to **Elite Plan** members. Upgrade your plan to participate in real-time chart discussions.
                </p>
                <Link
                  href="/settings"
                  className="mt-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:opacity-95 active:scale-[0.98]"
                >
                  Upgrade to Elite Plan
                </Link>
              </div>
            ) : null}

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
