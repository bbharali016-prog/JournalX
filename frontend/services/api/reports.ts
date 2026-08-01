import api from "./client";

export interface SymbolPerformance {
  symbol: string;
  trades: number;
  win_rate: number;
  profit: number;
}

export interface SessionPerformance {
  session: string;
  profit: number;
  trades: number;
}

export async function getSymbolPerformance(
  token: string,
  accountId?: number | null
): Promise<SymbolPerformance[]> {
  const { data } = await api.get<SymbolPerformance[]>(
    "/api/v1/analytics/symbol",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: accountId ? { account_id: accountId } : undefined,
    }
  );
  return data;
}

export async function getSessionPerformance(
  token: string,
  accountId?: number | null
): Promise<SessionPerformance[]> {
  const { data } = await api.get<SessionPerformance[]>(
    "/api/v1/analytics/session",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: accountId ? { account_id: accountId } : undefined,
    }
  );
  return data;
}

export async function downloadTradesReportCSV(
  token: string,
  accountId?: number | null
): Promise<void> {
  const response = await api.get("/api/v1/reports/export", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: accountId ? { account_id: accountId } : undefined,
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `trading_report_${accountId || "all"}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}
