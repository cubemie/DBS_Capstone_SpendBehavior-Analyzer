import React, { useCallback, useEffect, useState } from "react";
import { authService } from "../services/authService";
import { tokenStore } from "../services/apiClient";
import type { ApiUser } from "../types/models";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [predictionPersona, setPredictionPersona] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true saat restore session

  // ── Restore session saat app mount ──────────────────────────────────────────
  useEffect(() => {
    authService
      .tryRestoreSession()
      .then(async (result) => {
        if (result) {
          tokenStore.set(result.accessToken);
          try {
            const userProfile = await authService.getMe();
            setUser(userProfile);
          } catch {
            tokenStore.clear();
            setUser(null);
            setPredictionPersona(null);
          }
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authService.login({ email, password });
    tokenStore.set(result.accessToken);
    const userProfile = await authService.getMe();
    setUser(userProfile);
    setPredictionPersona(null);
  }, []);

  const register = useCallback(
    async (fullName: string, email: string, password: string) => {
      await authService.register({ fullName, email, password });
    },
    [],
  );

  const updateUser = useCallback(
    async (payload: { fullName?: string; phone?: string }) => {
      if (!user) return;
      const updatedUser = await authService.updateUser(payload);
      setUser(updatedUser);
    },
    [user],
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!user) return;
      const updatedUser = await authService.uploadAvatar(file);
      setUser(updatedUser);
    },
    [user],
  );

  const logout = useCallback(async () => {
    await authService.logout().catch(() => {}); // tetap logout meski request gagal
    tokenStore.clear();
    setUser(null);
    setPredictionPersona(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        predictionPersona,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        updateUser,
        uploadAvatar,
        setPredictionPersona,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
