import api from "./client";

export interface StripeSessionResponse {
  url: string;
}

export interface MockSuccessResponse {
  status: string;
  plan: string;
}

export async function createCheckoutSession(
  token: string,
  plan: string
): Promise<StripeSessionResponse> {
  const response = await api.post<StripeSessionResponse>(
    "/api/v1/stripe/create-checkout-session",
    { plan },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

export async function createPortalSession(
  token: string
): Promise<StripeSessionResponse> {
  const response = await api.post<StripeSessionResponse>(
    "/api/v1/stripe/create-portal-session",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

export async function triggerMockSuccess(
  token: string,
  plan: string,
  sessionId: string
): Promise<MockSuccessResponse> {
  const response = await api.post<MockSuccessResponse>(
    "/api/v1/stripe/mock-success",
    { plan, session_id: sessionId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}
