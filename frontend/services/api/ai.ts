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
  insights: CoachInsight[];
}

export async function getCoachSummary(
  token: string
): Promise<CoachSummary> {
  const { data } = await api.get("/api/v1/ai/coach", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}
