import { createContext } from "react";
import type { ApiUser } from "../types/models";

export interface AuthContextValue {
  user: ApiUser | null;
  predictionPersona: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  updateUser: (payload: { fullName?: string; phone?: string }) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  setPredictionPersona: (persona: string | null) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
