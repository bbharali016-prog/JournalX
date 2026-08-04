"use client";

import { Trade } from "@/types/trade";

interface Props {
  trades: Trade[];
  onDelete: (id: number) => void;
  onEdit: (trade: Trade) => void;
}

export default function TradeTable({
  trades,
  onDelete,
  onEdit,
}: Props) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const cleanBackendUrl = backendUrl.endsWith("/") ? backendUrl.slice(0, -1) : backendUrl;

  const getImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${cleanBackendUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  return (
    <div className="overflow-x-auto rounded-3xl border border-white/8 bg-white/[0.03] shadow-xl shadow-black/15">
      <table className="w-full text-sm">
        <thead className="border-b border-white/8 bg-white/[0.03]">
          <tr>
            <th className="p-4 text-left text-slate-400">Symbol</th>
            <th className="p-4 text-left text-slate-400">Side</th>
            <th className="p-4 text-left text-slate-400">Lot Size</th>
            <th className="p-4 text-left text-slate-400">Entry</th>
            <th className="p-4 text-left text-slate-400">Exit</th>
            <th className="p-4 text-left text-slate-400">Profit</th>
            <th className="p-4 text-left text-slate-400">Notes</th>
            <th className="p-4 text-center text-slate-400">Screenshot</th>
            <th className="p-4 text-center text-slate-400">Action</th>
          </tr>
        </thead>

        <tbody>
          {trades.length === 0 ? (
            <tr>
              <td
                colSpan={9}
                className="p-6 text-center text-slate-400"
              >
                No trades found.
              </td>
            </tr>
          ) : (
            trades.map((trade) => (
              <tr key={trade.id} className="border-b border-white/5">
                <td className="p-4 font-medium text-white">{trade.symbol}</td>

                <td
                  className={`p-4 font-semibold ${
                    trade.side === "BUY"
                      ? "text-emerald-400"
                      : "text-rose-400"
                  }`}
                >
                  {trade.side}
                </td>

                <td className="p-4 text-slate-300">{trade.lot_size}</td>

                <td className="p-4 text-slate-300">
                  {trade.entry_price}
                </td>

                <td className="p-4 text-slate-300">
                  {trade.exit_price}
                </td>

                <td
                  className={`p-4 font-bold ${
                    trade.profit >= 0
                      ? "text-emerald-400"
                      : "text-rose-400"
                  }`}
                >
                  ${trade.profit}
                </td>

                <td className="p-4 text-slate-300">
                  {trade.notes}
                </td>
                
                <td className="p-4 text-center">
                  {trade.image_url ? (
                    <a
                      href={getImageUrl(trade.image_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={getImageUrl(trade.image_url)}
                        alt="Trade Screenshot"
                        className="mx-auto h-16 w-16 rounded-lg object-cover border border-white/10"
                      />
                    </a>
                  ) : (
                    <span className="text-slate-500">No Image</span>
                  )}
                </td>

                <td className="p-4 text-center space-x-2">
                  <button
                    onClick={() => onEdit(trade)}
                    className="rounded-xl bg-violet-500/15 px-3 py-1 text-violet-200 hover:bg-violet-500/25"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => onDelete(trade.id)}
                    className="rounded-xl bg-rose-500/15 px-3 py-1 text-rose-200 hover:bg-rose-500/25"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
