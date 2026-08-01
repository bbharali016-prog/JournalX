import api from "./client";

export interface AnalyticsOverview {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  net_profit: number;
  profit_factor: number;
  expectancy: number;
  average_profit: number;
  average_loss: number;
  biggest_win: number;
  biggest_loss: number;
  win_streak: number;
  loss_streak: number;
  max_drawdown: number;
  avg_rr: number;
  daily_loss: number;
}

export interface TodaysSummary {
  trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  total_pnl: number;
}

export interface DrawdownPoint {
  time: number;
  value: number;
}

export async function getAnalyticsOverview(
  token: string,
  accountId?: number | null
): Promise<AnalyticsOverview> {
  const timezoneOffset = new Date().getTimezoneOffset();
  const { data } = await api.get(
    "/api/v1/analytics/overview",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        account_id: accountId || undefined,
        timezone_offset: timezoneOffset,
      },
    }
  );

  return data;
}

export async function getTodaysSummary(
  token: string,
  accountId?: number | null
): Promise<TodaysSummary> {
  const timezoneOffset = new Date().getTimezoneOffset();
  const { data } = await api.get(
    "/api/v1/analytics/today",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        account_id: accountId || undefined,
        timezone_offset: timezoneOffset,
      },
    }
  );

  return data;
}

export async function getDrawdownSeries(
  token: string,
  accountId?: number | null
): Promise<DrawdownPoint[]> {
  const { data } = await api.get(
    "/api/v1/analytics/drawdown",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: accountId ? { account_id: accountId } : undefined,
    }
  );

  return data;
}
