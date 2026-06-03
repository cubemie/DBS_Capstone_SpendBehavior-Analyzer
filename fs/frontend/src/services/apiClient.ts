import { ApiError } from "./ApiError";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";

// ─── Token store (module-level, bukan localStorage) ───────────────────────────
let _accessToken: string | null = null;

export const tokenStore = {
  get: () => _accessToken,
  set: (token: string | null) => {
    _accessToken = token;
  },
  clear: () => {
    _accessToken = null;
  },
};

// ─── Refresh deduplication ────────────────────────────────────────────────────
// Satu Promise dipakai bersama jika ada banyak request 401 paralel
let _refreshPromise: Promise<string> | null = null;

async function executeRefresh(): Promise<string> {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include", // kirim HTTP-only refresh cookie
  });

  if (!res.ok) throw new ApiError(res.status, "Session expired");

  const data = await res.json();
  tokenStore.set(data.accessToken);
  return data.accessToken;
}

export async function refreshAccessToken(): Promise<string> {
  if (!_refreshPromise) {
    _refreshPromise = executeRefresh().finally(() => {
      _refreshPromise = null;
    });
  }
  return _refreshPromise;
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
type RequestOptions = RequestInit & { skipAuth?: boolean };

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (!skipAuth && _accessToken) {
    headers["Authorization"] = `Bearer ${_accessToken}`;
  }

  const makeRequest = () =>
    fetch(`${BASE_URL}${path}`, {
      ...fetchOptions,
      headers,
      credentials: "include",
    });

  let res = await makeRequest();

  // Auto-refresh jika 401
  if (res.status === 401 && !skipAuth) {
    try {
      const newToken = await refreshAccessToken();
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await makeRequest();
    } catch {
      tokenStore.clear();
      window.location.href = "/";
      throw new ApiError(401, "Session expired");
    }
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  // Parse body
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      res.status,
      body.message ?? "Request failed",
      body.details,
    );
  }

  return body as T;
}
