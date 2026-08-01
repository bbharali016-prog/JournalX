import api from "./client";
import { CreateTrade, Trade } from "@/types/trade";

export async function getTrades(token: string, accountId?: number | null): Promise<Trade[]> {
  const { data } = await api.get("/api/v1/trades/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: accountId ? { account_id: accountId } : undefined,
  });

  return data;
}

export async function createTrade(
  trade: CreateTrade,
  token: string
): Promise<Trade> {
  const { data } = await api.post("/api/v1/trades/", trade, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function deleteTrade(
  id: number,
  token: string
) {
  await api.delete(`/api/v1/trades/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
export async function updateTrade(
  id: number,
  trade: CreateTrade,
  token: string
): Promise<Trade> {
  const { data } = await api.put(
    `/api/v1/trades/${id}`,
    trade,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
}
export async function uploadTradeImage(
  file: File,
  token: string
): Promise<string> {
  const formData = new FormData();

  formData.append("image", file);

  const { data } = await api.post(
    "/api/v1/trades/upload-image",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data.image_url;
}
