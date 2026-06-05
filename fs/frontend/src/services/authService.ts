import { apiRequest, refreshAccessToken } from "./apiClient";
import type { ApiUser, AuthTokens } from "../types/models";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

interface BackendUserResponse {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  phone?: string | null;
  persona?: string | null;
  createdAt: string;
}

function mapBackendUser(res: BackendUserResponse): ApiUser {
  return {
    id: res.id,
    name: res.fullName,
    email: res.email,
    avatarUrl: res.avatarUrl || undefined,
    phone: res.phone || undefined,
    persona: res.persona || undefined,
    createdAt: res.createdAt,
  };
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthTokens> {
    return apiRequest<AuthTokens>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },

  async register(payload: RegisterPayload): Promise<void> {
    const backendPayload = {
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password,
    };
    await apiRequest<void>("/auth/register", {
      method: "POST",
      body: JSON.stringify(backendPayload),
      skipAuth: true,
    });
  },

  async logout(): Promise<void> {
    await apiRequest<void>("/auth/logout", {
      method: "POST",
    });
  },

  async getMe(): Promise<ApiUser> {
    const res = await apiRequest<BackendUserResponse>("/auth/me");
    return mapBackendUser(res);
  },

  async updateUser(payload: { fullName?: string; phone?: string }): Promise<ApiUser> {
    const res = await apiRequest<BackendUserResponse>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return mapBackendUser(res);
  },

  async uploadAvatar(file: File): Promise<ApiUser> {
    const formData = new FormData();
    formData.append("avatar", file);

    const res = await apiRequest<BackendUserResponse>("/users/me/avatar", {
      method: "PATCH",
      body: formData,
    });

    return mapBackendUser(res);
  },

  async changePassword(payload: { oldPassword: string; newPassword: string }): Promise<void> {
    await apiRequest<void>("/users/me/password", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  // Dipanggil saat app mount — restore session dari refresh cookie
  async tryRestoreSession(): Promise<AuthTokens | null> {
    try {
      const accessToken = await refreshAccessToken();
      return { accessToken };
    } catch {
      return null;
    }
  },
};
