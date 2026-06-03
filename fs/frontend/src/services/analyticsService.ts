import { apiRequest } from "./apiClient";
import type { ApiDashboard } from "../types/models";

// ─── Raw backend shapes ───────────────────────────────────────────────────────
interface RawSummary {
  incomeTotalIdr: number;
  expenseTotalIdr: number;
  netTotalIdr: number;
  transactionCount: number;
  savingRatePercent?: number;
}

interface RawTopCategory {
  categoryId: string;
  name: string;
  slug: string;
  color: string | null;
  icon: string | null;
  amountIdr: number;
  percentage: number;
  transactionCount: number;
}

interface RawRecentTransaction {
  id: string;
  title: string;
  merchantName: string | null;
  paymentMethod: string | null;
  type: "income" | "expense";
  amountIdr: number;
  signedAmountIdr: number;
  transactionDate: string;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
    icon: string | null;
  };
}

interface RawWeekdayWeekend {
  weekdayTotalIdr: number;
  weekendTotalIdr: number;
  weekdayAverageDailyIdr: number;
  weekendAverageDailyIdr: number;
}

interface RawInsight {
  id: string;
  title: string;
  description: string;
  tone: "teal" | "coral" | "yellow" | "neutral";
}

interface RawWarning {
  id: string;
  title: string;
  description: string;
  label: string;
  severity: "info" | "warning" | "danger" | "success";
  source: "prediction";
}

interface RawMoneyLeak {
  id: string;
  title: string;
  description: string;
  label: string;
  severity: "warning" | "danger";
  categoryId: string;
  amountIdr: number;
  transactionCount: number;
}

interface RawDashboard {
  period: { from: string; to: string; timezone: string };
  summary: RawSummary;
  persona: unknown;
  recentTransactions: RawRecentTransaction[];
  topCategories: RawTopCategory[];
  trends: {
    weekly: unknown[];
    weekdayWeekend: RawWeekdayWeekend;
  };
  warnings: RawWarning[];
  moneyLeaks: RawMoneyLeak[];
  insights: RawInsight[];
}

// ─── Mapper ───────────────────────────────────────────────────────────────────
function mapInsightTone(tone: RawInsight["tone"]): "tip" | "alert" | "info" {
  if (tone === "coral") return "alert";
  if (tone === "yellow") return "tip";
  return "info";
}

function mapDashboard(raw: RawDashboard): ApiDashboard {
  return {
    summary: {
      totalIncome: raw.summary.incomeTotalIdr,
      totalExpense: raw.summary.expenseTotalIdr,
      netBalance: raw.summary.netTotalIdr,
    },
    topCategories: raw.topCategories.map((cat) => ({
      categoryId: cat.categoryId,
      categoryName: cat.name,
      total: cat.amountIdr,
      percentage: cat.percentage,
    })),
    recentTransactions: raw.recentTransactions.map((tx) => ({
      id: tx.id,
      amount: tx.amountIdr,
      note: tx.title, // backend 'title' maps to frontend 'note'
      date: tx.transactionDate,
      type: tx.type,
      category: {
        id: tx.category.id,
        name: tx.category.name,
        kind: tx.type,
        icon: tx.category.icon ?? undefined,
      },
      userId: "",
    })),
    weekdayWeekend: {
      weekday: raw.trends.weekdayWeekend.weekdayTotalIdr,
      weekend: raw.trends.weekdayWeekend.weekendTotalIdr,
    },
    insights: raw.insights.map((ins) => ({
      type: mapInsightTone(ins.tone),
      message: ins.description,
    })),
    warnings: raw.warnings.map((w) => ({
      id: w.id,
      severity: w.severity,
      message: w.description,
    })),
    moneyLeaks: raw.moneyLeaks.map((ml) => ({
      categoryName: ml.title.replace(" Sering Kecil-Kecil", "") || `Kategori`,
      amount: ml.amountIdr,
      frequency: ml.transactionCount,
    })),
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────
export const analyticsService = {
  async getDashboard(period: string = "current_month"): Promise<ApiDashboard> {
    const raw = await apiRequest<RawDashboard>(`/analytics/dashboard?period=${period}`);
    return mapDashboard(raw);
  },
};
