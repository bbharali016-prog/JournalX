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

const trades = [
  {
    pair: "XAUUSD",
    type: "BUY",
    lot: "1.00",
    profit: "+$245",
    rr: "2.5R",
  },
  {
    pair: "NAS100",
    type: "SELL",
    lot: "0.50",
    profit: "-$90",
    rr: "-1R",
  },
  {
    pair: "EURUSD",
    type: "BUY",
    lot: "0.30",
    profit: "+$120",
    rr: "1.8R",
  },
  {
    pair: "US30",
    type: "SELL",
    lot: "1.20",
    profit: "+$340",
    rr: "3.1R",
  },
];

export default function RecentTrades() {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">
          Recent Trades
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pair</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Lot</TableHead>
              <TableHead>Profit</TableHead>
              <TableHead>R:R</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {trades.map((trade, index) => (
              <TableRow key={index}>
                <TableCell>{trade.pair}</TableCell>

                <TableCell
                  className={
                    trade.type === "BUY"
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {trade.type}
                </TableCell>

                <TableCell>{trade.lot}</TableCell>

                <TableCell
                  className={
                    trade.profit.startsWith("+")
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {trade.profit}
                </TableCell>

                <TableCell>{trade.rr}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}