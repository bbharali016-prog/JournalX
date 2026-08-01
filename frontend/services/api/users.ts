import api from "./client";

export interface CurrentUser {
  id: number;
  full_name: string;
  email: string;
  profile_image_url?: string;
  plan?: string;
}

export async function getCurrentUser() {
  const response = await api.get<CurrentUser>("/api/v1/users/me");
  return response.data;
}

export async function updateProfile(
  token: string,
  payload: { full_name?: string; email?: string; profile_image_url?: string; plan?: string }
): Promise<CurrentUser> {
  const response = await api.put<CurrentUser>(
    "/api/v1/users/update",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

export async function uploadAvatar(
  token: string,
  file: File
): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<{ url: string }>(
    "/api/v1/users/upload-avatar",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}
