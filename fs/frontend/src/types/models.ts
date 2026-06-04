import type { LucideIcon } from "lucide-react";

export type TransactionType = "income" | "expense";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  persona: string;
  membership: "Free" | "Pro";
}

export interface Transaction {
  id: string;
  title: string;
  merchant: string;
  method: string;
  category: string;
  type: TransactionType;
  amount: number;
  date: string;
  icon: LucideIcon;
  accent: "teal" | "coral" | "yellow" | "neutral";
}

export interface SpendingCategory {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
  icon: LucideIcon;
}

export interface Budget {
  id: string;
  category: string;
  used: number;
  limit: number;
  color: string;
}

export interface Warning {
  id: string;
  title: string;
  description: string;
  label: string;
  severity: "info" | "warning" | "danger" | "success";
  actionLabel?: string;
  icon: LucideIcon;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  tone: "teal" | "coral" | "yellow" | "neutral";
  icon: LucideIcon;
}

export interface NavigationItem {
  path: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  desktopOnly?: boolean;
  isAction?: boolean;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface ApiUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  persona?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
}

// ─── Categories ──────────────────────────────────────────────────────────────
export type CategoryKind = "income" | "expense";

export interface ApiCategory {
  id: string;
  name: string;
  kind: CategoryKind;
  icon?: string;
}

// ─── Transactions ─────────────────────────────────────────────────────────────
/** Shape returned by the backend for individual transactions */
export interface ApiTransaction {
  id: string;
  title: string;
  /** Amount in IDR (always positive) */
  amount: number;
  note?: string;
  merchantName?: string;
  paymentMethod?: string;
  /** ISO 8601 date string */
  date: string;
  type: CategoryKind;
  category: ApiCategory;
  userId: string;
}

export interface TransactionFilters {
  type?: CategoryKind;
  categoryId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sort?: "date_desc" | "date_asc";
  page?: number;
  limit?: number;
}

export interface PaginatedTransactions {
  data: ApiTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiTransactionSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  period?: { start: string; end: string };
}

// ─── Analytics ───────────────────────────────────────────────────────────────
export interface TopCategory {
  categoryId: string;
  categoryName: string;
  total: number;
  percentage: number;
}

export interface WeekdayWeekendSplit {
  weekday: number;
  weekend: number;
}

export interface DashboardInsight {
  type: "tip" | "alert" | "info";
  message: string;
}

export interface DashboardWarning {
  id: string;
  title: string;
  description: string;
  label: string;
  severity: "info" | "warning" | "danger" | "success";
  source: string;
}

export interface MoneyLeak {
  id: string;
  title: string;
  description: string;
  label: string;
  severity: "warning" | "danger";
  categoryId: string;
  amountIdr: number;
  transactionCount: number;
}

export interface ApiDashboard {
  period: DashboardPeriod;
  summary: ApiTransactionSummary;
  persona: DashboardPersona | null;
  predictionStatus: DashboardPredictionStatus;
  topCategories: TopCategory[];
  recentTransactions: ApiTransaction[];
  weekdayWeekend: WeekdayWeekendSplit;
  insights: DashboardInsight[];
  warnings: DashboardWarning[];
  moneyLeaks: MoneyLeak[];
}

export interface DashboardPersona {
  id: string;
  persona: string;
  confidence: number;
  transactionCount: number;
  createdAt: string;
  predictionSource: "period" | null;
}

export interface DashboardPeriod {
  from: string;
  to: string;
  timezone: string;
}

export interface DashboardPredictionStatus {
  state: "empty" | "missing" | "stale" | "fresh";
  transactionCount: number;
  lastPredictedAt?: string;
  predictionSource: "period" | null;
}

// ─── Predictions ─────────────────────────────────────────────────────────────
export interface PersonaInput {
  monthlyIncome: number;
  monthlyExpense: number;
  topCategories: string[];
}

export interface ApiPrediction {
  id: string;
  persona: string;
  description: string;
  tips: string[];
  createdAt: string;
}

// ─── Error ───────────────────────────────────────────────────────────────────
export interface ApiErrorBody {
  message: string;
  details?: ValidationIssue[];
}

export interface ValidationIssue {
  field: string;
  message: string;
}
