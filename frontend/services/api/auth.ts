import api from "./client";

export async function login(email: string, password: string) {
  const response = await api.post("/api/v1/auth/login", {
    email,
    password,
  });

  return response.data;
}

export async function register(
  full_name: string,
  email: string,
  password: string
) {
  const response = await api.post("/api/v1/auth/register", {
    full_name,
    email,
    password,
  });

  return response.data;
}

export async function verifyOtp(email: string, otp: string) {
  const response = await api.post("/api/v1/auth/verify-otp", {
    email,
    otp,
  });

  return response.data;
}

export async function resendOtp(email: string) {
  const response = await api.post("/api/v1/auth/resend-otp", {
    email,
  });

  return response.data;
}

export async function forgotPassword(email: string) {
  const response = await api.post("/api/v1/auth/forgot-password", {
    email,
  });

  return response.data;
}

export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string
) {
  const response = await api.post("/api/v1/auth/reset-password", {
    email,
    otp,
    new_password: newPassword,
  });

  return response.data;
}

export async function socialLogin(
  email: string,
  name: string,
  provider: string,
  token?: string
) {
  const response = await api.post("/api/v1/auth/social-login", {
    email,
    name,
    provider,
    token,
  });

  return response.data;
}
