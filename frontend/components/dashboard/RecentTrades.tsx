"use client";

import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getTrades } from "@/services/api/trades";
import { Trade } from "@/types/trade";
import { useActiveAccount } from "@/components/auth/AccountContext";

export default function RecentTrades() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const { selectedAccountId } = useActiveAccount();

  useEffect(() => {
    async function loadTrades() {
      const token = localStorage.getItem("token");

      if (!token) return;

      try {
        const data = await getTrades(token, selectedAccountId);

        setTrades(data.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    }

    loadTrades();
  }, [selectedAccountId]);

  return (
    <Card className="border border-white/8 bg-white/[0.03] shadow-xl shadow-black/15">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-white">
          Recent Trades
        </CardTitle>
        <span className="text-sm text-violet-300">View all</span>
      </CardHeader>

      <CardContent>
        <div className="overflow-hidden rounded-2xl border border-white/8">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead>Pair</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Lot</TableHead>
                <TableHead>Entry</TableHead>
                <TableHead>Exit</TableHead>
                <TableHead>Profit</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {trades.map((trade) => (
                <TableRow key={trade.id} className="border-white/5">
                  <TableCell className="font-semibold text-white">
                    {trade.symbol}
                  </TableCell>

                  <TableCell
                    className={
                      trade.side === "BUY"
                        ? "font-medium text-emerald-400"
                        : "font-medium text-rose-400"
                    }
                  >
                    {trade.side}
                  </TableCell>

                  <TableCell className="text-slate-300">
                    {trade.lot_size}
                  </TableCell>

                  <TableCell className="text-slate-300">
                    {trade.entry_price}
                  </TableCell>

                  <TableCell className="text-slate-300">
                    {trade.exit_price}
                  </TableCell>

                  <TableCell
                    className={
                      trade.profit >= 0
                        ? "font-semibold text-emerald-400"
                        : "font-semibold text-rose-400"
                    }
                  >
                    ${trade.profit}
                  </TableCell>
                </TableRow>
              ))}

              {trades.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-slate-400"
                  >
                    No trades found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
