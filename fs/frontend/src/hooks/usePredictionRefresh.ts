import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  buildDashboardPeriod,
  type DashboardPeriodOption,
} from "../services/analyticsService";
import { predictionService } from "../services/predictionService";
import { ApiError } from "../services/ApiError";

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Gagal memperbarui analisis.";
}

export function usePredictionRefresh(
  onRefreshed?: () => void,
  period: DashboardPeriodOption = "current_month",
) {
  const navigate = useNavigate();
  const { setPredictionPersona } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState("");

  const refreshAnalysis = useCallback(async () => {
    const dashboardPeriod = buildDashboardPeriod(period);
    setIsRefreshing(true);
    setRefreshError("");

    try {
      const prediction = await predictionService.createPersonaPrediction({
        from: dashboardPeriod.from,
        to: dashboardPeriod.to,
        timezone: dashboardPeriod.timezone,
        force: true,
      });
      setPredictionPersona(prediction.persona);
      onRefreshed?.();
    } catch (error: unknown) {
      setRefreshError(getErrorMessage(error));
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefreshed, period, setPredictionPersona]);

  const goToAddTransaction = useCallback(() => {
    navigate("/tambah");
  }, [navigate]);

  return {
    refreshAnalysis,
    goToAddTransaction,
    isRefreshing,
    refreshError,
  };
}
