export interface CreateTrade {
  symbol: string;
  side: "BUY" | "SELL";
  lot_size: number;
  entry_price: number;
  exit_price: number;
  profit: number;
  notes?: string;
  image_url?: string;
  account_id?: number;
  created_at?: string;
}

export interface Trade {
  id: number;
  symbol: string;
  side: "BUY" | "SELL";
  lot_size: number;
  entry_price: number;
  exit_price: number;
  profit: number;
  notes?: string;
  image_url?: string;
  user_id: number;
  created_at: string;
  account_id?: number;
}
