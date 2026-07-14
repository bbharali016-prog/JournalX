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