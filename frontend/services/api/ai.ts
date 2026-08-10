import api from "./client";

export interface CoachInsight {
  title: string;
  detail: string;
  tone: "good" | "warning" | "danger";
}

export interface CoachSummary {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  next_actions: string[];
  risk_note: string;
  coach_score: number;
  discipline_score?: number;
  risk_score?: number;
  timing_score?: number;
  best_symbol?: string;
  worst_symbol?: string;
  best_session?: string;
  avg_rr_ratio?: string;
  insights: CoachInsight[];
}

export async function getCoachSummary(
  token: string,
  accountId?: number
): Promise<CoachSummary> {
  const url = accountId ? `/api/v1/ai/coach?account_id=${accountId}` : "/api/v1/ai/coach";
  const { data } = await api.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function sendAIChatMessage(
  token: string,
  message: string,
  accountId?: number
): Promise<{ reply: string; timestamp: string }> {
  const { data } = await api.post(
    "/api/v1/ai/chat",
    { message, account_id: accountId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
}

