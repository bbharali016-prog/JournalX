"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Copy,
  Check,
  Download,
  RefreshCw,
  Key,
  Server,
  AlertCircle,
  Cloud,
  Terminal,
  Activity,
  Trash2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getMT5Key,
  generateMT5Key,
  getMT5Accounts,
  connectMetaApi,
  getMetaApiConnection,
  disconnectMetaApi,
  syncMetaApiTrades,
} from "@/services/api/mt5";

export default function MT5Accounts() {
  const [activeTab, setActiveTab] = useState<"metaapi" | "ea">("metaapi");
  const [accounts, setAccounts] = useState<string[]>([]);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // MetaApi states
  const [metaapiToken, setMetaapiToken] = useState("");
  const [metaapiAccountId, setMetaapiAccountId] = useState("");
  const [connectedMetaApiId, setConnectedMetaApiId] = useState<string | null>(null);
  const [isConnectingMetaApi, setIsConnectingMetaApi] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const downloadUrl = `${backendUrl}/uploads/JournalX_Sync.mq5`;

  const loadMT5Data = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      const [keyData, accountsData, metaapiData] = await Promise.all([
        getMT5Key(token),
        getMT5Accounts(token),
        getMetaApiConnection(token),
      ]);
      setApiKey(keyData.api_key);
      setAccounts(accountsData);
      setConnectedMetaApiId(metaapiData.metaapi_account_id);
    } catch (error) {
      console.error("Error loading MT5 connection info:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMT5Data();
  }, []);

  const handleGenerateKey = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setIsGenerating(true);
      const data = await generateMT5Key(token);
      setApiKey(data.api_key);
    } catch (error) {
      console.error("Error generating MT5 key:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyKey = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(backendUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // MetaApi handlers
  const handleConnectMetaApi = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token || !metaapiToken || !metaapiAccountId) return;

    try {
      setIsConnectingMetaApi(true);
      await connectMetaApi(token, {
        metaapi_token: metaapiToken,
        metaapi_account_id: metaapiAccountId,
      });
      setConnectedMetaApiId(metaapiAccountId);
      setMetaapiToken("");
      setMetaapiAccountId("");
      loadMT5Data();
    } catch (error) {
      console.error("Error connecting MetaApi:", error);
    } finally {
      setIsConnectingMetaApi(false);
    }
  };

  const handleDisconnectMetaApi = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      await disconnectMetaApi(token);
      setConnectedMetaApiId(null);
      loadMT5Data();
    } catch (error) {
      console.error("Error disconnecting MetaApi:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncMetaApi = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setIsSyncing(true);
      setSyncMessage(null);
      const res = await syncMetaApiTrades(token);
      setSyncMessage(`Sync completed! ${res.synced} new trades added.`);
      loadMT5Data();
      setTimeout(() => setSyncMessage(null), 5000);
    } catch (error: any) {
      console.error("Error syncing MetaApi:", error);
      setSyncMessage(error.response?.data?.detail || "Sync failed. Please check credentials.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5 shadow-xl shadow-black/15">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">MT5 Accounts</h3>
        <Badge variant="outline" className="text-slate-400 border-white/10">
          {accounts.length} Connected
        </Badge>
      </div>

      <div className="mt-5 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-4 text-sm text-slate-400">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Loading accounts...
          </div>
        ) : accounts.length > 0 ? (
          <div className="space-y-3">
            {accounts.map((acc) => (
              <div key={acc} className="rounded-2xl border border-white/8 bg-[#0b1220] p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-white flex items-center gap-1.5">
                    {acc === connectedMetaApiId ? (
                      <Cloud className="h-3.5 w-3.5 text-cyan-400" />
                    ) : (
                      <Terminal className="h-3.5 w-3.5 text-violet-400" />
                    )}
                    MT5 Terminal
                  </p>
                  <p className="text-xs text-slate-400 mt-1">ID: {acc}</p>
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 hover:bg-emerald-500/15">
                  Connected
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5 rounded-2xl border border-dashed border-white/10 bg-black/10">
            <p className="text-sm text-slate-400">No trading accounts synced yet.</p>
            <p className="text-xs text-slate-500 mt-1">Connect your MT5 account automatically.</p>
          </div>
        )}

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={
            <Button className="w-full rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:opacity-95 font-medium">
              <Plus className="mr-2 h-4 w-4" />
              Connect MT5
            </Button>
          } />

          <DialogContent className="max-w-xl bg-[#090f1a] border border-white/10 text-white rounded-3xl p-6 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <Server className="h-6 w-6 text-violet-400" />
                Connect MT5 Integration
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-sm mt-1">
                Choose cloud synchronization using MetaApi or run a local script inside MT5.
              </DialogDescription>
            </DialogHeader>

            {/* Tab selection */}
            <div className="flex rounded-xl bg-black/40 p-1 border border-white/5">
              <button
                onClick={() => setActiveTab("metaapi")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "metaapi"
                    ? "bg-white/10 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Cloud className="h-4 w-4" />
                MetaApi Cloud (Recommended)
              </button>
              <button
                onClick={() => setActiveTab("ea")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "ea"
                    ? "bg-white/10 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Terminal className="h-4 w-4" />
                Local EA Script
              </button>
            </div>

            <div className="my-2 max-h-[55vh] overflow-y-auto pr-2 space-y-4">
              {activeTab === "metaapi" ? (
                /* MetaApi Cloud Tab */
                <div className="space-y-4 pt-1">
                  {connectedMetaApiId ? (
                    /* Connected state */
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-emerald-400">MetaApi Connected</p>
                          <p className="text-xs text-slate-400 mt-1">Account ID: {connectedMetaApiId}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleDisconnectMetaApi}
                          className="rounded-xl gap-1.5"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Disconnect
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Your account is deployed in the MetaApi cloud. Click below to synchronize your latest closed trades.
                        </p>
                        <Button
                          onClick={handleSyncMetaApi}
                          disabled={isSyncing}
                          className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-95 font-semibold"
                        >
                          {isSyncing ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                              Syncing trades from cloud...
                            </>
                          ) : (
                            <>
                              <Activity className="h-4 w-4 mr-2" />
                              Sync Trades Now
                            </>
                          )}
                        </Button>
                        {syncMessage && (
                          <p className="text-center text-xs font-medium text-cyan-400 animate-pulse mt-2">
                            {syncMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Connection form */
                    <form onSubmit={handleConnectMetaApi} className="space-y-4">
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Deploy your MetaTrader account to the cloud using MetaApi. Create an account on{" "}
                        <a href="https://metaapi.cloud" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline font-semibold">
                          MetaApi.cloud
                        </a>{" "}
                        and enter your connection details:
                      </p>

                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-400">MetaApi Token</label>
                          <input
                            type="password"
                            required
                            placeholder="Enter your MetaApi token"
                            value={metaapiToken}
                            onChange={(e) => setMetaapiToken(e.target.value)}
                            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-400">MetaApi Account ID</label>
                          <input
                            type="text"
                            required
                            placeholder="Enter your MetaApi account ID"
                            value={metaapiAccountId}
                            onChange={(e) => setMetaapiAccountId(e.target.value)}
                            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isConnectingMetaApi}
                        className="w-full rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-medium mt-2"
                      >
                        {isConnectingMetaApi ? (
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Connect Cloud Account
                      </Button>
                    </form>
                  )}
                </div>
              ) : (
                /* Local EA Script Tab */
                <div className="space-y-5 pt-1">
                  {/* Step 1: Download script */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600/20 text-xs font-bold text-violet-400">1</span>
                      Download the Synchronization Script
                    </h4>
                    <p className="text-xs text-slate-400 pl-8 leading-relaxed">
                      Download the Expert Advisor (EA) built for MT5. Save this file to your computer.
                    </p>
                    <div className="pl-8">
                      <a href={downloadUrl} download="JournalX_Sync.mq5">
                        <Button size="sm" className="rounded-xl bg-violet-600 hover:bg-violet-500 text-white gap-2 font-medium">
                          <Download className="h-4 w-4" />
                          Download JournalX_Sync.mq5
                        </Button>
                      </a>
                    </div>
                  </div>

                  {/* Step 2: Generate Key */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600/20 text-xs font-bold text-violet-400">2</span>
                      Generate your Unique MT5 API Key
                    </h4>
                    <p className="text-xs text-slate-400 pl-8 leading-relaxed">
                      Your MT5 script will use this key to securely identify you and sync your trades.
                    </p>
                    <div className="pl-8 flex items-center gap-3">
                      {apiKey ? (
                        <div className="flex-1 flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs font-mono text-slate-300 max-w-sm">
                          <span className="truncate">{apiKey}</span>
                          <Button variant="ghost" size="icon-sm" onClick={handleCopyKey} className="text-slate-400 hover:text-white">
                            {copiedKey ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" onClick={handleGenerateKey} disabled={isGenerating} className="rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white font-medium">
                          {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Key className="h-4 w-4 mr-2" />}
                          Generate API Key
                        </Button>
                      )}
                      {apiKey && (
                        <Button size="sm" variant="ghost" onClick={handleGenerateKey} disabled={isGenerating} className="rounded-xl text-slate-400 hover:text-white hover:bg-white/5" title="Regenerate Key">
                          <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Step 3: Install in MT5 */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600/20 text-xs font-bold text-violet-400">3</span>
                      Install in MetaTrader 5
                    </h4>
                    <ul className="text-xs text-slate-400 pl-8 space-y-2 list-disc leading-relaxed">
                      <li>In MT5, click <b>File</b> in the top menu and select <b>Open Data Folder</b>.</li>
                      <li>Open the <b>MQL5</b> folder, then open the <b>Experts</b> folder.</li>
                      <li>Copy and paste the downloaded <b>JournalX_Sync.mq5</b> file into this Experts folder.</li>
                      <li>Restart MT5 or right-click <b>Expert Advisors</b> in the Navigator panel and click <b>Refresh</b>.</li>
                    </ul>
                  </div>

                  {/* Step 4: Allow WebRequest */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600/20 text-xs font-bold text-violet-400">4</span>
                      Enable Web Requests in MT5
                    </h4>
                    <p className="text-xs text-slate-400 pl-8 leading-relaxed">
                      Go to <b>Tools</b> &rarr; <b>Options</b> &rarr; <b>Expert Advisors</b>, check <b>"Allow WebRequest for listed URL"</b>, and add:
                    </p>
                    <div className="pl-8 flex items-center gap-3">
                      <div className="flex-1 flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs font-mono text-slate-300 max-w-sm">
                        <span className="truncate">{backendUrl}</span>
                        <Button variant="ghost" size="icon-sm" onClick={handleCopyUrl} className="text-slate-400 hover:text-white">
                          {copiedUrl ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Step 5: Start the EA */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600/20 text-xs font-bold text-violet-400">5</span>
                      Activate the Sync Script
                    </h4>
                    <ul className="text-xs text-slate-400 pl-8 space-y-2 list-disc leading-relaxed">
                      <li>In the MT5 Navigator panel under <b>Expert Advisors</b>, find <b>JournalX_Sync</b>.</li>
                      <li>Drag and drop it onto any active chart.</li>
                      <li>In the <b>Inputs</b> tab of the popup window, double-click the <b>InpApiKey</b> field and paste your API key.</li>
                      <li>Double-click the <b>InpServerUrl</b> field and enter the Server URL: <code>{backendUrl}</code></li>
                      <li>Click <b>OK</b>. Ensure <b>Algo Trading</b> is enabled in the top MT5 toolbar.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs text-amber-300">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="leading-relaxed">
                {activeTab === "metaapi" ? (
                  <>
                    <b>Notice:</b> MetaApi cloud synchronization requires your MT5 account to remain deployed and online in your MetaApi dashboard.
                  </>
                ) : (
                  <>
                    <b>Notice:</b> Once activated, the script will instantly upload your closed trades and sync new trades in real-time. Do not close the chart where the script is active.
                  </>
                )}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
