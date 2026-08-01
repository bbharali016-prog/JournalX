"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown } from "lucide-react";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/#" },
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Resources", href: "/#resources" },
    { label: "About", href: "/#about" },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-[#02060d] text-white">
      {/* Background Gradients */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(20,184,166,0.18),transparent_28%),radial-gradient(circle_at_72%_25%,rgba(124,58,237,0.18),transparent_32%),linear-gradient(180deg,#02060d_0%,#050b18_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(45,212,191,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.045)_1px,transparent_1px)] bg-[size:88px_88px]" />
        <div className="absolute right-[12%] top-[8%] h-[34rem] w-[34rem] rounded-full bg-violet-600/18 blur-3xl" />
        <div className="absolute left-[35%] top-[22%] h-[22rem] w-[22rem] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Navigation Header */}
        <section className="mx-auto max-w-[1420px] px-5 py-5 lg:px-10">
          <header className="flex items-center justify-between gap-5 py-2">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white p-1.5 shadow-[0_0_35px_rgba(45,212,191,0.18)]">
                <Image
                  src="/brand/journalfx-logo.png"
                  alt="JournalFX"
                  width={48}
                  height={48}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <span className="bg-gradient-to-r from-white via-white to-teal-300 bg-clip-text text-3xl font-medium tracking-tight text-transparent [font-family:Georgia,serif]">
                JournalFX
              </span>
            </Link>

            <nav className="hidden items-center gap-12 lg:flex">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href.startsWith("/#") && pathname === "/");
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`inline-flex items-center gap-1 text-sm font-medium transition hover:text-teal-200 ${
                      isActive ? "text-teal-300 font-semibold" : "text-slate-200"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="hidden text-sm font-medium text-slate-200 transition hover:text-white sm:inline-flex"
              >
                Log in
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center rounded-xl border border-cyan-300/40 bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 text-sm font-semibold shadow-[0_0_35px_rgba(124,58,237,0.35)] transition hover:opacity-95"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </header>
        </section>

        {/* Page Content */}
        {children}

        {/* Shared Footer */}
        <section className="mx-auto max-w-[1420px] px-5 pb-10 lg:px-10 mt-16">
          <footer className="border-t border-white/10 pt-10 text-center md:flex md:items-center md:justify-between md:text-left">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-3 md:justify-start">
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-[0_0_15px_rgba(45,212,191,0.1)]">
                  <Image
                    src="/brand/journalfx-logo.png"
                    alt="JournalFX"
                    width={32}
                    height={32}
                    className="h-full w-full object-contain"
                  />
                </div>
                <span className="text-xl font-medium tracking-tight [font-family:Georgia,serif]">
                  JournalFX
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Track. Analyze. Improve. Your companion for consistency.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-400 md:mt-0">
              <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
              <Link href="/resources" className="hover:text-white transition">Resources</Link>
              <Link href="/#about" className="hover:text-white transition">About Us</Link>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
            </div>

            <p className="mt-6 text-xs text-slate-500 md:mt-0">
              &copy; {new Date().getFullYear()} JournalFX. All rights reserved.
            </p>
          </footer>
        </section>
      </div>
    </div>
  );
}
