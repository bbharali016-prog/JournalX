"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, Sparkles, TrendingUp, ShieldAlert, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "sync" | "profit" | "risk" | "ai";
  read: boolean;
  link?: string;
}

const initialNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "MetaAPI MT5 Sync Active",
    message: "GoatFunded MT5 account connected. 15 trades synchronized successfully.",
    time: "Just now",
    type: "sync",
    read: false,
    link: "/journal",
  },
  {
    id: "notif-2",
    title: "Profit Milestone Achieved",
    message: "GOATFUNDED-1 has reached $493.86 (98.8% of $500 target!).",
    time: "2h ago",
    type: "profit",
    read: false,
    link: "/dashboard",
  },
  {
    id: "notif-3",
    title: "Daily Risk Limit Healthy",
    message: "Zero drawdown used today ($0 of $250 max daily limit).",
    time: "5h ago",
    type: "risk",
    read: false,
    link: "/risk",
  },
  {
    id: "notif-4",
    title: "AI Coach Insight Available",
    message: "Your win rate on GBP/USD is 60%. Check your performance breakdown in AI Coach.",
    time: "1d ago",
    type: "ai",
    read: true,
    link: "/ai",
  },
];

export default function NotificationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "sync":
        return <Zap className="h-4 w-4 text-cyan-400" />;
      case "profit":
        return <TrendingUp className="h-4 w-4 text-emerald-400" />;
      case "risk":
        return <ShieldAlert className="h-4 w-4 text-amber-400" />;
      case "ai":
        return <Sparkles className="h-4 w-4 text-violet-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative border border-white/10 text-slate-300 hover:bg-white/5 cursor-pointer"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-3xl border border-white/10 bg-[#0c1427]/95 p-4 shadow-2xl shadow-black/80 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold text-violet-300 border border-violet-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition cursor-pointer"
              >
                <CheckCheck className="h-3.5 w-3.5 text-slate-400" />
                Mark all read
              </button>
            )}
          </div>

          <div className="mt-3 max-h-80 space-y-2.5 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No notifications right now
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`group relative flex items-start gap-3 rounded-2xl p-3 transition border ${
                    notif.read
                      ? "border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
                      : "border-violet-500/30 bg-violet-500/[0.08] hover:bg-violet-500/[0.12]"
                  }`}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <Link
                      href={notif.link || "#"}
                      onClick={() => setIsOpen(false)}
                      className="block text-xs font-semibold text-white hover:text-violet-300 truncate"
                    >
                      {notif.title}
                    </Link>
                    <p className="mt-0.5 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="mt-1 block text-[10px] text-slate-500">
                      {notif.time}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notif.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-300 transition p-1 cursor-pointer absolute right-2 top-2"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 border-t border-white/10 pt-2.5 text-center">
            <Link
              href="/ai"
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-violet-400 hover:text-violet-300 transition inline-flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" />
              Ask AI Coach for deep account analysis
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

