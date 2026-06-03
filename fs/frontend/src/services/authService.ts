import { apiRequest } from "./apiClient";
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

export const authService = {
  async login(payload: LoginPayload): Promise<AuthTokens> {
    return apiRequest<AuthTokens>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },

  async register(payload: RegisterPayload): Promise<AuthTokens> {
    const backendPayload = {
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password,
    };
    const result = await apiRequest<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify(backendPayload),
      skipAuth: true,
    });
    return {
      accessToken: result.accessToken,
      user: result.user ? {
        id: result.user.id,
        name: result.user.fullName,
        email: result.user.email,
        avatarUrl: result.user.avatarUrl || undefined,
        phone: result.user.phone || undefined,
        persona: result.user.persona || undefined,
        createdAt: result.user.createdAt,
      } : undefined,
    } as unknown as AuthTokens;
  },

  async logout(): Promise<void> {
    await apiRequest<void>("/auth/logout", {
      method: "POST",
    });
  },

  async getMe(): Promise<ApiUser> {
    const res = await apiRequest<any>("/auth/me");
    return {
      id: res.id,
      name: res.fullName,
      email: res.email,
      avatarUrl: res.avatarUrl || undefined,
      phone: res.phone || undefined,
      persona: res.persona || undefined,
      createdAt: res.createdAt,
    };
  },

  // Dipanggil saat app mount — restore session dari refresh cookie
  async tryRestoreSession(): Promise<AuthTokens | null> {
    try {
      const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";
      const res = await fetch(`${baseUrl}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },
};

