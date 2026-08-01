import api from "./client";

export interface Account {
  id: number;
  name: string;
  platform: string; // "MT5", "MT4", "Manual"
  broker: string | null;
  funded_firm: string | null;
  login_id: string | null;
  server: string | null;
  account_size: number;
  daily_loss_limit: number | null;
  max_drawdown: number | null;
  profit_target: number | null;
  currency: string;
  sync_enabled: boolean;
  status: string;
  created_at: string;
}

export interface AccountCreateData {
  name: string;
  platform: string;
  broker?: string;
  funded_firm?: string;
  login_id?: string;
  server?: string;
  password?: string;
  account_size: number;
  daily_loss_limit?: number;
  max_drawdown?: number;
  profit_target?: number;
  currency?: string;
}

export interface AccountUpdateData {
  name?: string;
  sync_enabled?: boolean;
  status?: string;
  account_size?: number;
  daily_loss_limit?: number;
  max_drawdown?: number;
  profit_target?: number;
}

export async function getAccounts(token: string): Promise<Account[]> {
  const { data } = await api.get<Account[]>("/api/v1/accounts/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}

export async function createAccount(
  token: string,
  accountData: AccountCreateData
): Promise<Account> {
  const { data } = await api.post<Account>("/api/v1/accounts/", accountData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}

export async function updateAccount(
  token: string,
  accountId: number,
  accountData: AccountUpdateData
): Promise<Account> {
  const { data } = await api.patch<Account>(
    `/api/v1/accounts/${accountId}`,
    accountData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
}

export async function deleteAccount(
  token: string,
  accountId: number
): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(
    `/api/v1/accounts/${accountId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
}
