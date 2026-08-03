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
