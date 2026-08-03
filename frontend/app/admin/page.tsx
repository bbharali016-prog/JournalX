"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCurrentUser } from "@/components/auth/UserContext";
import {
  Users,
  CreditCard,
  Crown,
  Activity,
  Search,
  CheckCircle2,
  XCircle,
  Database,
  Lock,
} from "lucide-react";
import {
  getAdminStats,
  getAdminUsers,
  updateUserPlan,
  updateUserStatus,
  AdminStats,
  UserAdminView,
} from "@/services/api/admin";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function AdminPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const router = useRouter();
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersList, setUsersList] = useState<UserAdminView[]>([]);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const limit = 20;

  const loadAdminData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    setError("");
    try {
      // Load stats & users in parallel
      const [statsData, usersData] = await Promise.all([
        getAdminStats(token),
        getAdminUsers(token, page, limit, search, planFilter),
      ]);

      setStats(statsData);
      setUsersList(usersData.users);
      setTotalUsersCount(usersData.total_count);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load admin data. Verify admin role or token.");
    } finally {
      setLoading(false);
    }
  }, [page, search, planFilter]);

  useEffect(() => {
    if (!userLoading) {
      if (!user) {
        router.push("/login");
      } else if (!user.is_admin) {
        // Redirection handled after brief delay or showing custom access denied
      } else {
        loadAdminData();
      }
    }
  }, [user, userLoading, router, loadAdminData]);

  const handlePlanChange = async (userId: number, newPlan: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await updateUserPlan(token, userId, newPlan);
      // Reload stats & users to update state
      loadAdminData();
    } catch (err) {
      console.error("Failed to update plan:", err);
      alert("Failed to update user plan.");
    }
  };

  const handleStatusToggle = async (userId: number, currentStatus: boolean) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await updateUserStatus(token, userId, !currentStatus);
      // Reload stats & users to update state
      loadAdminData();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update user status.");
    }
  };

  if (userLoading || (!user && !userLoading)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#050b18] text-white">
        <p className="text-sm font-medium text-slate-400">Verifying session...</p>
      </div>
    );
  }

  // Security gate - non-admin access denied screen
  if (user && !user.is_admin) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#050b18] text-white p-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-4 animate-bounce">
          <Lock className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Access Denied
        </h1>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          This workspace is restricted to administrator accounts only. If you believe this is an error, contact platform support.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-6 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:opacity-95 transition"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Title Section */}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white lg:text-4xl">
            Admin Management Panel
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Monitor platform metrics, manage user plans, overrides and active statuses.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-400">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border border-white/8 bg-white/[0.03] shadow-xl shadow-black/15">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Total Users</p>
                  <h3 className="text-2xl font-bold mt-1 text-white">
                    {stats ? stats.total_users : "..."}
                  </h3>
                </div>
                <div className="rounded-xl bg-violet-500/10 p-3 text-violet-400">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-white/8 bg-white/[0.03] shadow-xl shadow-black/15">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Pro Subscriptions</p>
                  <h3 className="text-2xl font-bold mt-1 text-violet-300">
                    {stats ? stats.pro_users : "..."}
                  </h3>
                </div>
                <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400">
                  <CreditCard className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-white/8 bg-white/[0.03] shadow-xl shadow-black/15">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Elite Subscriptions</p>
                  <h3 className="text-2xl font-bold mt-1 text-emerald-400">
                    {stats ? stats.elite_users : "..."}
                  </h3>
                </div>
                <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
                  <Crown className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-white/8 bg-white/[0.03] shadow-xl shadow-black/15">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Synced Accounts & Trades</p>
                  <h3 className="text-md font-bold mt-1 text-white">
                    {stats ? `${stats.active_accounts} Accs / ${stats.total_trades} Trades` : "..."}
                  </h3>
                </div>
                <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
                  <Activity className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter controls */}
        <Card className="border border-white/8 bg-white/[0.03] p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 rounded-xl border-white/10 bg-black/30 text-white placeholder:text-slate-500 focus:border-violet-500/50"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value);
                setPage(1);
              }}
              className="w-full md:w-48 rounded-xl border border-white/10 bg-[#050b18] px-3 py-2.5 text-xs text-white outline-none focus:border-violet-500/50"
            >
              <option value="">All Subscription Tiers</option>
              <option value="Free">Free Plan</option>
              <option value="Pro">Pro Plan</option>
              <option value="Elite">Elite Plan</option>
            </select>
          </div>
        </Card>

        {/* User Management Table */}
        <Card className="border border-white/8 bg-white/[0.03] shadow-xl shadow-black/15">
          <CardHeader>
            <CardTitle className="text-white text-lg">User Registry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-2xl border border-white/8">
              <table className="w-full border-collapse text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-white/8 bg-white/[0.02] text-slate-400 font-medium">
                    <th className="px-4 py-3.5">ID</th>
                    <th className="px-4 py-3.5">Name</th>
                    <th className="px-4 py-3.5">Email</th>
                    <th className="px-4 py-3.5">Plan Level</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Role</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {usersList.map((usr) => (
                    <tr key={usr.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-4 py-4 font-mono text-xs">{usr.id}</td>
                      <td className="px-4 py-4 font-semibold text-white">{usr.full_name}</td>
                      <td className="px-4 py-4">{usr.email}</td>
                      <td className="px-4 py-4">
                        <select
                          value={usr.plan}
                          onChange={(e) => handlePlanChange(usr.id, e.target.value)}
                          className="rounded-lg border border-white/10 bg-[#050b18] px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer focus:border-violet-500/50"
                        >
                          <option value="Free">Free</option>
                          <option value="Pro">Pro</option>
                          <option value="Elite">Elite</option>
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        {usr.is_active ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                            <CheckCircle2 className="h-4 w-4" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-rose-400 text-xs font-semibold">
                            <XCircle className="h-4 w-4" /> Suspended
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {usr.is_admin ? (
                          <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/25 text-xs">
                            Admin
                          </Badge>
                        ) : (
                          <Badge className="bg-white/5 text-slate-400 border border-white/5 text-xs">
                            Member
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => handleStatusToggle(usr.id, usr.is_active)}
                          className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition border ${
                            usr.is_active
                              ? "border-rose-500/30 bg-rose-500/5 text-rose-400 hover:bg-rose-500/10"
                              : "border-emerald-500/30 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10"
                          }`}
                        >
                          {usr.is_active ? "Suspend" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}

                  {!loading && usersList.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        No users registered or matching query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalUsersCount > limit && (
              <div className="flex items-center justify-between mt-5">
                <p className="text-xs text-slate-500">
                  Showing {usersList.length} of {totalUsersCount} registered users
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1 || loading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-xl border border-white/10 px-4 py-2.5 text-xs text-slate-300 hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page * limit >= totalUsersCount || loading}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-xl border border-white/10 px-4 py-2.5 text-xs text-slate-300 hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
