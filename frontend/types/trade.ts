export interface Trade {
  id: number;
  symbol: string;
  side: "BUY" | "SELL";
  lot_size: number;
  entry_price: number;
  exit_price: number;
  profit: number;
  notes?: string;
  user_id: number;
}

export interface CreateTrade {
  symbol: string;
  side: "BUY" | "SELL";
  lot_size: number;
  entry_price: number;
  exit_price: number;
  profit: number;
  notes?: string;
}