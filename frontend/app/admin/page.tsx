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
  Lock,
  Eye,
  Trash2,
  TrendingUp,
  TrendingDown,
  Wallet,
  BookOpen,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
} from "lucide-react";
import {
  getAdminStats,
  getAdminUsers,
  updateUserPlan,
  updateUserStatus,
  deleteUserAdmin,
  getUserFullDetails,
  getAllPlatformTrades,
  AdminStats,
  UserAdminView,
  UserDetailsResponse,
  AdminTradeDetail,
} from "@/services/api/admin";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

function AdminContent() {
  const { user, loading: userLoading } = useCurrentUser();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"users" | "inspector" | "trades">("users");

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersList, setUsersList] = useState<UserAdminView[]>([]);
  const [totalUsersCount, setTotalUsersCount] = useState(0);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Inspector State
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [inspectingUser, setInspectingUser] = useState<UserDetailsResponse | null>(null);
  const [inspectorLoading, setInspectorLoading] = useState(false);

  // Platform Trades Stream State
  const [allTrades, setAllTrades] = useState<AdminTradeDetail[]>([]);
  const [tradesLoading, setTradesLoading] = useState(false);

  const limit = 20;

  const loadAdminData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    setError("");
    try {
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
        // Handled below
      } else {
        loadAdminData();
      }
    }
  }, [user, userLoading, router, loadAdminData]);

  // Inspect User Data
  const handleInspectUser = async (userId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setSelectedUserId(userId);
    setActiveTab("inspector");
    setInspectorLoading(true);
    try {
      const data = await getUserFullDetails(token, userId);
      setInspectingUser(data);
    } catch (err) {
      console.error("Failed to fetch user details:", err);
      alert("Failed to load user trading records.");
    } finally {
      setInspectorLoading(false);
    }
  };

  // Load All Trades
  const handleLoadTradesFeed = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setTradesLoading(true);
    try {
      const data = await getAllPlatformTrades(token, 1, 50);
      setAllTrades(data.trades);
    } catch (err) {
      console.error("Failed to load trades feed:", err);
    } finally {
      setTradesLoading(false);
    }
  };

  const handlePlanChange = async (userId: number, newPlan: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await updateUserPlan(token, userId, newPlan);
      loadAdminData();
      if (selectedUserId === userId) {
        handleInspectUser(userId);
      }
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
      loadAdminData();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update user status.");
    }
  };

  const handleDeleteUser = async (userId: number, email: string) => {
    if (!confirm(`Are you sure you want to permanently delete user ${email} and all their accounts and trades?`)) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await deleteUserAdmin(token, userId);
      loadAdminData();
      if (selectedUserId === userId) {
        setInspectingUser(null);
        setSelectedUserId(null);
        setActiveTab("users");
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Failed to delete user.");
    }
  };

  if (userLoading || (!user && !userLoading)) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center text-white">
        <p className="text-sm font-medium text-slate-400">Verifying session...</p>
      </div>
    );
  }

  // Security gate - non-admin access denied screen
  if (user && !user.is_admin) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center text-white p-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-4 animate-bounce">
          <Lock className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Access Denied
        </h1>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          This workspace is restricted to administrator accounts only.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-6 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:opacity-95 transition cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-violet-400" />
            Admin Management & Trade Explorer
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Monitor platform metrics, manage user plans, and inspect all user accounts & trade records.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl border border-white/10 bg-white/[0.02]">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "users"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Users className="h-4 w-4" />
            User Registry
          </button>

          <button
            onClick={() => {
              setActiveTab("inspector");
              if (!inspectingUser && usersList.length > 0) {
                const traderUser = usersList.find((u) => !u.is_admin) || usersList[0];
                handleInspectUser(traderUser.id);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "inspector"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Layers className="h-4 w-4" />
            User Trade Inspector
          </button>

          <button
            onClick={() => {
              setActiveTab("trades");
              handleLoadTradesFeed();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "trades"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Activity className="h-4 w-4" />
            Global Trade Feed
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-400">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border border-white/8 bg-white/[0.03] shadow-xl shadow-black/15">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">Total Users</p>
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
                <p className="text-xs font-medium text-slate-400">Pro Subscriptions</p>
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
                <p className="text-xs font-medium text-slate-400">Elite Subscriptions</p>
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
                <p className="text-xs font-medium text-slate-400">Synced Accounts & Trades</p>
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

      {/* TAB 1: USER REGISTRY */}
      {activeTab === "users" && (
        <div className="space-y-4">
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
              <CardTitle className="text-white text-lg">User Registry & Platform Members</CardTitle>
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
                        <td className="px-4 py-4 font-mono text-xs text-slate-500">#{usr.id}</td>
                        <td className="px-4 py-4 font-semibold text-white">{usr.full_name}</td>
                        <td className="px-4 py-4 font-mono text-xs">{usr.email}</td>
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
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleInspectUser(usr.id)}
                              className="flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300 hover:bg-violet-500/20 transition cursor-pointer"
                              title="Inspect user accounts and trades"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Inspect
                            </button>

                            <button
                              onClick={() => handleStatusToggle(usr.id, usr.is_active)}
                              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition border cursor-pointer ${
                                usr.is_active
                                  ? "border-rose-500/30 bg-rose-500/5 text-rose-400 hover:bg-rose-500/10"
                                  : "border-emerald-500/30 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10"
                              }`}
                            >
                              {usr.is_active ? "Suspend" : "Activate"}
                            </button>

                            {!usr.is_admin && (
                              <button
                                onClick={() => handleDeleteUser(usr.id, usr.email)}
                                className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-1.5 text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                                title="Delete user"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
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
                      className="rounded-xl border border-white/10 px-4 py-2.5 text-xs text-slate-300 hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                    >
                      Previous
                    </button>
                    <button
                      disabled={page * limit >= totalUsersCount || loading}
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded-xl border border-white/10 px-4 py-2.5 text-xs text-slate-300 hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: USER ACCOUNTS & TRADES INSPECTOR */}
      {activeTab === "inspector" && (
        <div className="space-y-6">
          {/* User Selector Dropdown */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-400">Select User to Inspect:</label>
              <select
                value={selectedUserId || ""}
                onChange={(e) => handleInspectUser(Number(e.target.value))}
                className="rounded-xl border border-white/10 bg-[#050b18] px-4 py-2 text-xs font-semibold text-white outline-none focus:border-violet-500"
              >
                {usersList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.email}) - {u.plan}
                  </option>
                ))}
              </select>
            </div>

            {inspectingUser && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Plan:</span>
                <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30">
                  {inspectingUser.user.plan}
                </Badge>
                <Badge className={inspectingUser.user.is_active ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-rose-500/20 text-rose-300 border-rose-500/30"}>
                  {inspectingUser.user.is_active ? "Active" : "Suspended"}
                </Badge>
              </div>
            )}
          </div>

          {inspectorLoading ? (
            <div className="flex h-48 items-center justify-center text-slate-400 text-sm">
              Loading user accounts & trading records...
            </div>
          ) : inspectingUser ? (
            <div className="space-y-6">
              {/* User Overview Metric Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="border border-white/8 bg-white/[0.03] p-4">
                  <span className="text-xs text-slate-400">Net Profit</span>
                  <p className={`text-xl font-bold mt-1 ${inspectingUser.stats.net_profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {inspectingUser.stats.net_profit >= 0 ? "+" : ""}${inspectingUser.stats.net_profit.toLocaleString()}
                  </p>
                </Card>

                <Card className="border border-white/8 bg-white/[0.03] p-4">
                  <span className="text-xs text-slate-400">Win Rate</span>
                  <p className="text-xl font-bold mt-1 text-white">
                    {inspectingUser.stats.win_rate}%
                  </p>
                </Card>

                <Card className="border border-white/8 bg-white/[0.03] p-4">
                  <span className="text-xs text-slate-400">Total Trades</span>
                  <p className="text-xl font-bold mt-1 text-violet-300">
                    {inspectingUser.stats.total_trades} ({inspectingUser.stats.winning_trades}W / {inspectingUser.stats.total_trades - inspectingUser.stats.winning_trades}L)
                  </p>
                </Card>

                <Card className="border border-white/8 bg-white/[0.03] p-4">
                  <span className="text-xs text-slate-400">Connected Accounts</span>
                  <p className="text-xl font-bold mt-1 text-cyan-400">
                    {inspectingUser.stats.accounts_count} Accounts
                  </p>
                </Card>
              </div>

              {/* Connected Accounts Section */}
              <Card className="border border-white/8 bg-white/[0.03]">
                <CardHeader>
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-cyan-400" />
                    Trading Accounts for {inspectingUser.user.full_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {inspectingUser.accounts.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">No trading accounts linked for this user.</p>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-white/5">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead>
                          <tr className="border-b border-white/5 bg-white/[0.02] text-slate-500 font-medium">
                            <th className="p-3">Account Name</th>
                            <th className="p-3">Platform / Broker</th>
                            <th className="p-3">Login ID / Server</th>
                            <th className="p-3 text-right">Account Size</th>
                            <th className="p-3 text-right">Target</th>
                            <th className="p-3 text-center">Trades</th>
                            <th className="p-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {inspectingUser.accounts.map((acc) => (
                            <tr key={acc.id} className="hover:bg-white/[0.01]">
                              <td className="p-3 font-semibold text-white">{acc.name}</td>
                              <td className="p-3">{acc.platform} {acc.broker ? `(${acc.broker})` : ""}</td>
                              <td className="p-3 font-mono text-slate-400">{acc.login_id || "N/A"} {acc.server ? `[${acc.server}]` : ""}</td>
                              <td className="p-3 text-right font-semibold text-emerald-400">${acc.account_size.toLocaleString()}</td>
                              <td className="p-3 text-right text-slate-400">${acc.profit_target.toLocaleString()}</td>
                              <td className="p-3 text-center font-bold text-violet-300">{acc.trades_count}</td>
                              <td className="p-3 text-center">
                                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                                  {acc.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Trades List Section */}
              <Card className="border border-white/8 bg-white/[0.03]">
                <CardHeader>
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-violet-400" />
                    Complete Trade History ({inspectingUser.trades.length} Records)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {inspectingUser.trades.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">No trades found for this user.</p>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-white/5">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead>
                          <tr className="border-b border-white/5 bg-white/[0.02] text-slate-500 font-medium">
                            <th className="p-3">Date</th>
                            <th className="p-3">Pair</th>
                            <th className="p-3 text-center">Type</th>
                            <th className="p-3 text-center">Account</th>
                            <th className="p-3 text-right">Lots</th>
                            <th className="p-3 text-right">Entry</th>
                            <th className="p-3 text-right">Exit</th>
                            <th className="p-3 text-right">Profit / Loss</th>
                            <th className="p-3">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {inspectingUser.trades.map((t) => (
                            <tr key={t.id} className="hover:bg-white/[0.01]">
                              <td className="p-3 text-slate-400 whitespace-nowrap">
                                {new Date(t.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </td>
                              <td className="p-3 font-semibold text-white">{t.symbol}</td>
                              <td className="p-3 text-center">
                                <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded ${
                                  t.side === "BUY" ? "bg-blue-500/20 text-blue-300" : "bg-rose-500/20 text-rose-300"
                                }`}>
                                  {t.side === "BUY" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                  {t.side}
                                </span>
                              </td>
                              <td className="p-3 text-center text-slate-400 font-mono text-[11px]">{t.account_name}</td>
                              <td className="p-3 text-right font-mono">{t.lot_size}</td>
                              <td className="p-3 text-right font-mono">{t.entry_price}</td>
                              <td className="p-3 text-right font-mono">{t.exit_price}</td>
                              <td className={`p-3 text-right font-bold font-mono ${t.profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                {t.profit >= 0 ? "+" : ""}${t.profit.toFixed(2)}
                              </td>
                              <td className="p-3 text-slate-400 text-[11px] max-w-xs truncate">{t.notes || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">Select a user to inspect their trading data.</p>
          )}
        </div>
      )}

      {/* TAB 3: GLOBAL TRADES STREAM */}
      {activeTab === "trades" && (
        <Card className="border border-white/8 bg-white/[0.03]">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                Live Platform Trade Activity Feed
              </span>
              <button
                onClick={handleLoadTradesFeed}
                className="text-xs font-normal text-violet-400 hover:underline cursor-pointer"
              >
                Refresh Stream
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tradesLoading ? (
              <div className="flex h-32 items-center justify-center text-slate-400 text-sm">
                Fetching live trades from all users...
              </div>
            ) : allTrades.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No trades found on platform.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-white/5">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02] text-slate-500 font-medium">
                      <th className="p-3">Trader</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Pair</th>
                      <th className="p-3 text-center">Type</th>
                      <th className="p-3 text-right">Lots</th>
                      <th className="p-3 text-right">Entry</th>
                      <th className="p-3 text-right">Exit</th>
                      <th className="p-3 text-right">Profit / Loss</th>
                      <th className="p-3">Account</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allTrades.map((t) => (
                      <tr key={t.id} className="hover:bg-white/[0.01]">
                        <td className="p-3">
                          <p className="font-semibold text-white">{t.user_name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{t.user_email}</p>
                        </td>
                        <td className="p-3 text-slate-400 whitespace-nowrap">
                          {new Date(t.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="p-3 font-semibold text-white">{t.symbol}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded ${
                            t.side === "BUY" ? "bg-blue-500/20 text-blue-300" : "bg-rose-500/20 text-rose-300"
                          }`}>
                            {t.side}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono">{t.lot_size}</td>
                        <td className="p-3 text-right font-mono">{t.entry_price}</td>
                        <td className="p-3 text-right font-mono">{t.exit_price}</td>
                        <td className={`p-3 text-right font-bold font-mono ${t.profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {t.profit >= 0 ? "+" : ""}${t.profit.toFixed(2)}
                        </td>
                        <td className="p-3 text-slate-400 font-mono text-[11px]">{t.account_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <DashboardLayout>
      <AdminContent />
    </DashboardLayout>
  );
}

