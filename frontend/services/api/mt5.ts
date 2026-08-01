import api from "./client";

export interface MT5KeyResponse {
  api_key: string | null;
}

export interface MetaApiConnectionResponse {
  metaapi_account_id: string | null;
  metaapi_token_present: boolean;
}

export interface MetaApiConnectRequest {
  metaapi_token: string;
  metaapi_account_id: string;
}

export interface SyncResponse {
  status: string;
  synced: number;
}

export async function getMT5Key(token: string): Promise<MT5KeyResponse> {
  const { data } = await api.get<MT5KeyResponse>("/api/v1/mt5/key", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}

export async function generateMT5Key(token: string): Promise<MT5KeyResponse> {
  const { data } = await api.post<MT5KeyResponse>("/api/v1/mt5/generate-key", {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}

export async function getMT5Accounts(token: string): Promise<string[]> {
  const { data } = await api.get<string[]>("/api/v1/mt5/accounts", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}

// MetaApi Integrations
export async function connectMetaApi(
  token: string,
  payload: MetaApiConnectRequest
): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>("/api/v1/mt5/metaapi/connect", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}

export async function getMetaApiConnection(
  token: string
): Promise<MetaApiConnectionResponse> {
  const { data } = await api.get<MetaApiConnectionResponse>("/api/v1/mt5/metaapi/connection", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}

export async function disconnectMetaApi(
  token: string
): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>("/api/v1/mt5/metaapi/connection", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}

export async function syncMetaApiTrades(
  token: string
): Promise<SyncResponse> {
  const { data } = await api.post<SyncResponse>("/api/v1/mt5/metaapi/sync", {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}
