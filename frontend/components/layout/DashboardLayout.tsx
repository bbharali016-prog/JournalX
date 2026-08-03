"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/header/Header";
import { UserProvider, useCurrentUser } from "@/components/auth/UserContext";
import { AccountProvider } from "@/components/auth/AccountContext";

function ProtectedLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useCurrentUser();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#050b18] text-white">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-violet-500" />
          <p className="text-sm font-medium text-slate-400">Loading your journal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen">
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      <section className="flex min-w-0 flex-1 flex-col">
        <Header onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

        <div className="flex-1 px-4 pb-6 pt-4 lg:px-6">
          {children}
        </div>
      </section>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#050b18] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-violet-600/15 blur-3xl" />
        <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <UserProvider>
        <AccountProvider>
          <ProtectedLayoutContent>{children}</ProtectedLayoutContent>
        </AccountProvider>
      </UserProvider>
    </main>
  );
}
