"use client";

import { Trade } from "@/types/trade";

interface Props {
  trades: Trade[];
}

export default function TradeTable({ trades }: Props) {
  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <table className="w-full">
        <thead className="border-b bg-gray-50">
          <tr>
            <th className="p-4 text-left">Symbol</th>
            <th className="p-4 text-left">Side</th>
            <th className="p-4 text-left">Lot</th>
            <th className="p-4 text-left">Profit</th>
          </tr>
        </thead>

        <tbody>
          {trades.map((trade) => (
            <tr key={trade.id} className="border-b">
              <td className="p-4">{trade.symbol}</td>

              <td
                className={`p-4 font-semibold ${
                  trade.side === "BUY"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {trade.side}
              </td>

              <td className="p-4">{trade.lot_size}</td>

              <td
                className={`p-4 font-bold ${
                  trade.profit >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                ${trade.profit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}