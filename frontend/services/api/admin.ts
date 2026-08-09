import api from "./client";

export interface AdminStats {
  total_users: number;
  free_users: number;
  pro_users: number;
  elite_users: number;
  active_accounts: number;
  total_trades: number;
}

export interface UserAdminView {
  id: number;
  full_name: string;
  email: string;
  is_active: boolean;
  plan: string;
  is_admin: boolean;
}

export interface UsersListResponse {
  users: UserAdminView[];
  total_count: number;
  page: number;
  limit: number;
}

export async function getAdminStats(token: string): Promise<AdminStats> {
  const response = await api.get<AdminStats>("/api/v1/admin/stats", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function getAdminUsers(
  token: string,
  page: number = 1,
  limit: number = 20,
  search?: string,
  plan?: string
): Promise<UsersListResponse> {
  const params: Record<string, string | number> = { page, limit };
  if (search) params.search = search;
  if (plan) params.plan = plan;

  const response = await api.get<UsersListResponse>("/api/v1/admin/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });
  return response.data;
}

export async function updateUserPlan(
  token: string,
  userId: number,
  plan: string
): Promise<UserAdminView> {
  const response = await api.put<UserAdminView>(
    `/api/v1/admin/users/${userId}/plan`,
    { plan },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

export interface AdminAccountDetail {
  id: number;
  name: string;
  platform: string;
  broker?: string;
  funded_firm?: string;
  login_id?: string;
  server?: string;
  account_size: number;
  profit_target: number;
  status: string;
  sync_enabled: boolean;
  created_at: string;
  trades_count: number;
}

export interface AdminTradeDetail {
  id: number;
  symbol: string;
  side: string;
  lot_size: number;
  entry_price: number;
  exit_price: number;
  profit: number;
  notes?: string;
  created_at: string;
  account_id?: number;
  account_name: string;
  user_id?: number;
  user_name?: string;
  user_email?: string;
}

export interface UserDetailsResponse {
  user: UserAdminView & { metaapi_account_id?: string };
  stats: {
    total_trades: number;
    winning_trades: number;
    net_profit: number;
    win_rate: number;
    accounts_count: number;
  };
  accounts: AdminAccountDetail[];
  trades: AdminTradeDetail[];
}

export interface PlatformTradesResponse {
  trades: AdminTradeDetail[];
  total_count: number;
  page: number;
  limit: number;
}

export async function getUserFullDetails(token: string, userId: number): Promise<UserDetailsResponse> {
  const response = await api.get<UserDetailsResponse>(`/api/v1/admin/users/${userId}/details`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function getAllPlatformTrades(
  token: string,
  page: number = 1,
  limit: number = 25,
  userId?: number
): Promise<PlatformTradesResponse> {
  const params: Record<string, string | number> = { page, limit };
  if (userId) params.user_id = userId;

  const response = await api.get<PlatformTradesResponse>("/api/v1/admin/trades", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });
  return response.data;
}

export async function updateUserStatus(
  token: string,
  userId: number,
  isActive: boolean
): Promise<UserAdminView> {
  const response = await api.put<UserAdminView>(
    `/api/v1/admin/users/${userId}/status`,
    { is_active: isActive },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

export async function deleteUserAdmin(token: string, userId: number): Promise<{ message: string }> {
  const response = await api.delete<{ message: string }>(`/api/v1/admin/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}


