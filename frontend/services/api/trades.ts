import api from "./client";
import { CreateTrade, Trade } from "@/types/trade";

export async function getTrades(token: string): Promise<Trade[]> {
  const { data } = await api.get("/api/v1/trades", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function createTrade(
  trade: CreateTrade,
  token: string
): Promise<Trade> {
  const { data } = await api.post("/api/v1/trades", trade, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}