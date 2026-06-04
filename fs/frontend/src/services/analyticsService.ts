import { apiRequest } from "./apiClient";
import type { ApiDashboard } from "../types/models";

const DASHBOARD_TIMEZONE = "Asia/Jakarta";
const JAKARTA_OFFSET = "+07:00";

export type DashboardPeriodOption = "current_month" | "last_month" | "3_months";

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
      title: w.title,
      description: w.description,
      label: w.label,
      severity: w.severity,
      source: w.source,
    })),
    moneyLeaks: raw.moneyLeaks.map((ml) => ({
      id: ml.id,
      title: ml.title,
      description: ml.description,
      label: ml.label,
      severity: ml.severity,
      categoryId: ml.categoryId,
      amountIdr: ml.amountIdr,
      transactionCount: ml.transactionCount,
    })),
  };
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function getZonedDateParts(date: Date): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: DASHBOARD_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const getPart = (type: string) => Number(parts.find((part) => part.type === type)?.value);

  return {
    year: getPart("year"),
    month: getPart("month"),
    day: getPart("day"),
  };
}

function formatJakartaDateTime(
  year: number,
  month: number,
  day: number,
  time: string,
): string {
  return `${year}-${pad(month)}-${pad(day)}T${time}${JAKARTA_OFFSET}`;
}

function getLastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
  };
}

function buildPeriodParams(period: DashboardPeriodOption): URLSearchParams {
  const now = getZonedDateParts(new Date());
  const params = new URLSearchParams({ timezone: DASHBOARD_TIMEZONE });

  if (period === "last_month") {
    const target = addMonths(now.year, now.month, -1);
    params.set("from", formatJakartaDateTime(target.year, target.month, 1, "00:00:00.000"));
    params.set(
      "to",
      formatJakartaDateTime(
        target.year,
        target.month,
        getLastDayOfMonth(target.year, target.month),
        "23:59:59.999",
      ),
    );
    return params;
  }

  if (period === "3_months") {
    const start = addMonths(now.year, now.month, -2);
    params.set("from", formatJakartaDateTime(start.year, start.month, 1, "00:00:00.000"));
    params.set("to", formatJakartaDateTime(now.year, now.month, now.day, "23:59:59.999"));
    return params;
  }

  params.set("from", formatJakartaDateTime(now.year, now.month, 1, "00:00:00.000"));
  params.set("to", formatJakartaDateTime(now.year, now.month, now.day, "23:59:59.999"));
  return params;
}

// ─── Service ──────────────────────────────────────────────────────────────────
export const analyticsService = {
  async getDashboard(period: DashboardPeriodOption = "current_month"): Promise<ApiDashboard> {
    const params = buildPeriodParams(period);
    const raw = await apiRequest<RawDashboard>(`/analytics/dashboard?${params}`);
    return mapDashboard(raw);
  },
};
