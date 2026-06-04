import { apiRequest } from "./apiClient";
import { ApiError } from "./ApiError";
import type { ApiPrediction } from "../types/models";

// ─── Raw backend shape ────────────────────────────────────────────────────────
interface RawPredictionRecord {
  id: string;
  userId: string;
  persona: string;
  confidence: number;
  probabilities: {
    emotional: number;
    impulsive: number;
    rational: number;
  };
  warnings: string[];
  featureOrder: string[];
  transactionCount: number;
  createdAt: string;
  cached?: boolean;
}

// ─── Persona description map ──────────────────────────────────────────────────
const PERSONA_DESCRIPTIONS: Record<string, string> = {
  "rational spender":
    "Kamu cenderung berbelanja secara rasional dan terencana. Keputusan keuanganmu didasarkan pada kebutuhan.",
  "impulsive spender":
    "Kamu sesekali melakukan pembelian impulsif. Perhatikan pengeluaran mendadak agar budget tetap terjaga.",
  "emotional spender":
    "Emosi sering memengaruhi keputusan belanjamu. Coba terapkan jeda sebelum membeli sesuatu.",
};

export function getPersonaDescription(persona: string): string {
  const key = persona.toLowerCase();
  return (
    PERSONA_DESCRIPTIONS[key] ??
    `Persona keuanganmu adalah ${persona}. Terus pantau pola pengeluaranmu.`
  );
}

function mapPrediction(raw: RawPredictionRecord): ApiPrediction {
  return {
    id: raw.id,
    persona: raw.persona,
    description: getPersonaDescription(raw.persona),
    // warnings from backend become tips in the frontend
    tips: raw.warnings ?? [],
    createdAt: raw.createdAt,
  };
}

// ─── Payload sent to backend ──────────────────────────────────────────────────
export interface CreatePredictionPayload {
  from?: string;
  to?: string;
  timezone?: string;
  force?: boolean;
}

// ─── Service ──────────────────────────────────────────────────────────────────
export const predictionService = {
  async createPersonaPrediction(
    payload: CreatePredictionPayload = {},
  ): Promise<ApiPrediction> {
    const body: CreatePredictionPayload = {
      timezone: "Asia/Jakarta",
      force: false,
      ...payload,
    };
    const raw = await apiRequest<RawPredictionRecord>("/predictions/persona", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return mapPrediction(raw);
  },

  async getLatestPrediction(): Promise<ApiPrediction | null> {
    try {
      const raw = await apiRequest<RawPredictionRecord>("/predictions/latest");
      return mapPrediction(raw);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }

      throw error;
    }
  },
};
