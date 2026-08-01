import api from "./client";

export interface DashboardStats {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  net_profit: number;
  average_profit: number;
  average_loss: number;
}

export async function getDashboardStats(
  token: string,
  accountId?: number | null
): Promise<DashboardStats> {
  const { data } = await api.get("/api/v1/dashboard/stats", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: accountId ? { account_id: accountId } : undefined,
  });

  return data;
}

export interface EquityPoint {
  time: number;
  value: number;
}


export async function getEquityCurve(
  token: string,
  accountId?: number | null
): Promise<EquityPoint[]> {

  const { data } = await api.get(
    "/api/v1/dashboard/equity",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: accountId ? { account_id: accountId } : undefined,
    }
  );

  return data;
}

export interface MonthlyPerformance {
  month: string;
  profit: number;
}

export async function getMonthlyPerformance(
  token: string,
  accountId?: number | null
): Promise<MonthlyPerformance[]> {
  const { data } = await api.get(
    "/api/v1/dashboard/monthly-performance",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: accountId ? { account_id: accountId } : undefined,
    }
  );

  return data;
}


export interface CalendarDay {
  date: string;
  profit: number;
  trades: number;
}

export async function getCalendarData(
  token: string,
  accountId?: number | null
): Promise<CalendarDay[]> {
  const { data } = await api.get(
    "/api/v1/dashboard/calendar",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: accountId ? { account_id: accountId } : undefined,
    }
  );

  return data;
}