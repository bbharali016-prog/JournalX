"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Plus,
  Trash2,
  Lock,
  Unlock,
  RefreshCw,
  MoreVertical,
  Activity,
  AlertTriangle,
  Eye,
  EyeOff,
  Globe,
  Settings,
} from "lucide-react";
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  Account,
} from "@/services/api/accounts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const inputClass =
  "mt-1.5 rounded-xl border-white/10 bg-black/30 text-white placeholder:text-slate-500 caret-white outline-none focus:border-violet-500/50";

const selectClass =
  "w-full mt-1.5 rounded-xl border border-white/10 bg-[#050b18] px-3 py-2.5 text-xs text-white outline-none focus:border-violet-500/50";

export default function FundedPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Modals state
  const [isAutoSyncOpen, setIsAutoSyncOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states - Auto Sync
  const [autoPlatform, setAutoPlatform] = useState("MT5");
  const [autoBroker, setAutoBroker] = useState("IC Markets");
  const [autoServer, setAutoServer] = useState("");
  const [autoLoginId, setAutoLoginId] = useState("");
  const [autoPassword, setAutoPassword] = useState("");
  const [autoName, setAutoName] = useState("");
  const [autoFundedFirm, setAutoFundedFirm] = useState("Funded Account");

  // Form states - Manual
  const [manualName, setManualName] = useState("");
  const [manualBroker, setManualBroker] = useState("IC Markets");
  const [manualFundedFirm, setManualFundedFirm] = useState("Personal Account");
  const [manualSize, setManualSize] = useState("");
  const [manualDailyLoss, setManualDailyLoss] = useState("");
  const [manualMaxDrawdown, setManualMaxDrawdown] = useState("");
  const [manualProfitTarget, setManualProfitTarget] = useState("");
  const [manualCurrency, setManualCurrency] = useState("USD");

  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
    if (storedToken) {
      loadAccounts(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  async function loadAccounts(authToken: string) {
    try {
      setLoading(true);
      const data = await getAccounts(authToken);
      setAccounts(data);
    } catch (err) {
      console.error("Error loading accounts:", err);
    } finally {
      setLoading(false);
    }
  }

  // Toggle sync state
  async function handleToggleSync(account: Account) {
    if (!token) return;
    try {
      const updated = await updateAccount(token, account.id, {
        sync_enabled: !account.sync_enabled,
      });
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === account.id ? updated : acc))
      );
    } catch (err) {
      console.error("Failed to toggle sync:", err);
    }
  }

  // Delete account
  async function handleDelete(accountId: number) {
    if (!token) return;
    if (!confirm("Are you sure you want to delete this trading account?")) return;
    try {
      await deleteAccount(token, accountId);
      setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
    } catch (err) {
      console.error("Failed to delete account:", err);
    }
  }

  // Submit Connect Account (Auto Sync)
  async function handleConnectAutoSync(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    try {
      setFormSubmitting(true);
      const payload = {
        name: autoName || `${autoFundedFirm} ${autoPlatform}`,
        platform: autoPlatform,
        broker: autoBroker,
        funded_firm: autoFundedFirm,
        login_id: autoLoginId,
        server: autoServer,
        password: autoPassword,
        account_size: 10000, // placeholder size for auto sync or fetched later
      };
      const newAcc = await createAccount(token, payload);
      setAccounts((prev) => [newAcc, ...prev]);
      setIsAutoSyncOpen(false);
      resetAutoForm();
    } catch (err) {
      console.error("Error connecting auto sync account:", err);
    } finally {
      setFormSubmitting(false);
    }
  }

  // Submit Add Manual Account
  async function handleSaveManual(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    try {
      setFormSubmitting(true);
      const payload = {
        name: manualName,
        platform: "Manual",
        broker: manualBroker,
        funded_firm: manualFundedFirm,
        account_size: parseFloat(manualSize) || 0,
        daily_loss_limit: parseFloat(manualDailyLoss) || undefined,
        max_drawdown: parseFloat(manualMaxDrawdown) || undefined,
        profit_target: parseFloat(manualProfitTarget) || undefined,
        currency: manualCurrency,
      };
      const newAcc = await createAccount(token, payload);
      setAccounts((prev) => [newAcc, ...prev]);
      setIsManualOpen(false);
      resetManualForm();
    } catch (err) {
      console.error("Error creating manual account:", err);
    } finally {
      setFormSubmitting(false);
    }
  }

  function resetAutoForm() {
    setAutoPlatform("MT5");
    setAutoBroker("IC Markets");
    setAutoServer("");
    setAutoLoginId("");
    setAutoPassword("");
    setAutoName("");
    setAutoFundedFirm("Funded Account");
  }

  function resetManualForm() {
    setManualName("");
    setManualBroker("IC Markets");
    setManualFundedFirm("Personal Account");
    setManualSize("");
    setManualDailyLoss("");
    setManualMaxDrawdown("");
    setManualProfitTarget("");
    setManualCurrency("USD");
  }

  const formatCurrency = (val: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(val);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Block */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-xl shadow-black/15">
          <div>
            <div className="flex items-center gap-3">
              <p className="text-sm text-slate-400">Funded Accounts</p>
              <Badge className="bg-violet-500/10 text-violet-300 border border-violet-500/20 text-xs">
                {accounts.length} {accounts.length === 1 ? "Account" : "Accounts"}
              </Badge>
            </div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
              My Trading Accounts
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Manage your connected MT4/MT5 accounts or add manual accounts to organize your trading workspaces.
            </p>
          </div>

          <div className="flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold flex items-center gap-2 px-5 py-3 hover:opacity-95 cursor-pointer border border-transparent outline-none">
                <Plus className="h-4.5 w-4.5" />
                Add Account
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-popover border border-white/10 rounded-2xl p-1.5 min-w-[240px]">
                <DropdownMenuItem
                  onClick={() => setIsAutoSyncOpen(true)}
                  className="rounded-xl px-4 py-3 flex flex-col items-start gap-1 cursor-pointer text-white hover:bg-white/5"
                >
                  <span className="font-semibold text-sm">1. Connect MT5 / MT4</span>
                  <span className="text-xs text-slate-400">Automatic Syncing</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsManualOpen(true)}
                  className="rounded-xl px-4 py-3 flex flex-col items-start gap-1 cursor-pointer text-white hover:bg-white/5 mt-1"
                >
                  <span className="font-semibold text-sm">2. Add Manual Account</span>
                  <span className="text-xs text-slate-400">Manually Log Trades</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Accounts Table Grid */}
        <div className="rounded-3xl border border-white/8 bg-white/[0.02] overflow-hidden shadow-xl shadow-black/25">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01] text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4.5">Account</th>
                  <th className="px-6 py-4.5">Platform</th>
                  <th className="px-6 py-4.5">Balance</th>
                  <th className="px-6 py-4.5">Equity</th>
                  <th className="px-6 py-4.5">Status</th>
                  <th className="px-6 py-4.5">Auto Sync</th>
                  <th className="px-6 py-4.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-violet-400" />
                      Loading trading accounts...
                    </td>
                  </tr>
                ) : accounts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-3 text-slate-500" />
                      <p className="font-medium text-white">No trading accounts found</p>
                      <p className="text-xs text-slate-500 mt-1">Connect your first account to get started.</p>
                    </td>
                  </tr>
                ) : (
                  accounts.map((account) => {
                    const balance = account.account_size;
                    const equity = account.account_size; // default for mock demo
                    const isManual = account.platform === "Manual";

                    return (
                      <tr key={account.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold ${
                              account.platform === "MT5"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                : account.platform === "MT4"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            }`}>
                              {account.platform === "MT5" ? "M5" : account.platform === "MT4" ? "M4" : "MA"}
                            </div>
                            <div>
                              <p className="font-bold text-white leading-tight">{account.name}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{account.broker || "Local"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className="bg-white/5 border border-white/10 text-slate-300 font-medium text-xs rounded-lg px-2.5 py-1">
                            {account.platform}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 font-semibold text-white">
                          {formatCurrency(balance, account.currency)}
                        </td>
                        <td className="px-6 py-4 font-semibold text-emerald-400">
                          {formatCurrency(equity, account.currency)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            account.status === "Online"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              account.status === "Online" ? "bg-emerald-400" : "bg-amber-400"
                            }`} />
                            {account.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">{isManual ? "Manual" : "Auto"}</span>
                            <button
                              type="button"
                              onClick={() => !isManual && handleToggleSync(account)}
                              disabled={isManual}
                              className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                                isManual
                                  ? "bg-slate-800 opacity-50 cursor-not-allowed"
                                  : account.sync_enabled
                                  ? "bg-violet-500 cursor-pointer"
                                  : "bg-slate-700 cursor-pointer"
                              }`}
                            >
                              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                account.sync_enabled ? "translate-x-5" : "translate-x-1"
                              }`} />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white cursor-pointer transition border border-transparent outline-none">
                              <MoreVertical className="h-4.5 w-4.5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-popover border border-white/10 rounded-xl min-w-[120px]">
                              <DropdownMenuItem
                                onClick={() => handleDelete(account.id)}
                                className="text-red-400 hover:text-red-300 rounded-lg cursor-pointer hover:bg-white/5 flex items-center gap-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* dialog 1: Connect MT5 / MT4 (Auto Sync) */}
      <Dialog open={isAutoSyncOpen} onOpenChange={setIsAutoSyncOpen}>
        <DialogContent className="sm:max-w-md bg-[#090f1d] border border-white/10 p-6 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-violet-400" />
              Connect MT5 / MT4 Account
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleConnectAutoSync} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-medium">Platform</label>
                <div className="flex rounded-xl bg-black/40 p-1 border border-white/5 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setAutoPlatform("MT5")}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                      autoPlatform === "MT5" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    MT5
                  </button>
                  <button
                    type="button"
                    onClick={() => setAutoPlatform("MT4")}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                      autoPlatform === "MT4" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    MT4
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Broker</label>
                <select
                  value={autoBroker}
                  onChange={(e) => setAutoBroker(e.target.value)}
                  className={selectClass}
                >
                  <option value="IC Markets">IC Markets</option>
                  <option value="Pepperstone">Pepperstone</option>
                  <option value="FTMO">FTMO Broker</option>
                  <option value="FxPro">FxPro</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium">Server</label>
              <Input
                type="text"
                placeholder="e.g. ICMarketsSC-Live"
                value={autoServer}
                onChange={(e) => setAutoServer(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium">Login ID</label>
              <Input
                type="text"
                placeholder="e.g. 12345678"
                value={autoLoginId}
                onChange={(e) => setAutoLoginId(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium">Password</label>
              <div className="relative mt-1.5">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter account password"
                  value={autoPassword}
                  onChange={(e) => setAutoPassword(e.target.value)}
                  required
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-medium">Account Name (Optional)</label>
                <Input
                  type="text"
                  placeholder="e.g. FTMO 100K"
                  value={autoName}
                  onChange={(e) => setAutoName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Account Type</label>
                <select
                  value={autoFundedFirm}
                  onChange={(e) => setAutoFundedFirm(e.target.value)}
                  className={selectClass}
                >
                  <option value="Personal Account">Personal Account</option>
                  <option value="Funded Account">Funded Account</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAutoSyncOpen(false)}
                className="rounded-xl border-white/10 bg-white/5 text-white flex-1 py-3 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={formSubmitting}
                className="rounded-xl bg-violet-600 hover:bg-violet-500 text-white flex-1 py-3 font-semibold cursor-pointer"
              >
                {formSubmitting ? "Connecting..." : "Connect Account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog 2: Add Manual Account */}
      <Dialog open={isManualOpen} onOpenChange={setIsManualOpen}>
        <DialogContent className="sm:max-w-md bg-[#090f1d] border border-white/10 p-6 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-emerald-400" />
              Add Manual Account
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveManual} className="space-y-4 pt-2">
            <div>
              <label className="text-xs text-slate-400 font-medium">Account Name</label>
              <Input
                type="text"
                placeholder="e.g. Personal Account"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-medium">Broker</label>
                <select
                  value={manualBroker}
                  onChange={(e) => setManualBroker(e.target.value)}
                  className={selectClass}
                >
                  <option value="IC Markets">IC Markets</option>
                  <option value="Pepperstone">Pepperstone</option>
                  <option value="FTMO">FTMO Broker</option>
                  <option value="Manual">Local/Manual</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Account Type</label>
                <select
                  value={manualFundedFirm}
                  onChange={(e) => setManualFundedFirm(e.target.value)}
                  className={selectClass}
                >
                  <option value="Personal Account">Personal Account</option>
                  <option value="Funded Account">Funded Account</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-medium">Account Size (USD)</label>
                <Input
                  type="number"
                  placeholder="e.g. 10000"
                  value={manualSize}
                  onChange={(e) => setManualSize(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Currency</label>
                <select
                  value={manualCurrency}
                  onChange={(e) => setManualCurrency(e.target.value)}
                  className={selectClass}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-medium">Daily Loss Limit</label>
                <Input
                  type="number"
                  placeholder="500"
                  value={manualDailyLoss}
                  onChange={(e) => setManualDailyLoss(e.target.value)}
                  className={`${inputClass} text-xs`}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Max Drawdown</label>
                <Input
                  type="number"
                  placeholder="1000"
                  value={manualMaxDrawdown}
                  onChange={(e) => setManualMaxDrawdown(e.target.value)}
                  className={`${inputClass} text-xs`}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Profit Target</label>
                <Input
                  type="number"
                  placeholder="1000"
                  value={manualProfitTarget}
                  onChange={(e) => setManualProfitTarget(e.target.value)}
                  className={`${inputClass} text-xs`}
                />
              </div>
            </div>

            <DialogFooter className="pt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsManualOpen(false)}
                className="rounded-xl border-white/10 bg-white/5 text-white flex-1 py-3 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={formSubmitting}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex-1 py-3 font-semibold cursor-pointer"
              >
                {formSubmitting ? "Saving..." : "Save Account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
