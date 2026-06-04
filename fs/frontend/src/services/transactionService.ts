import { apiRequest } from "./apiClient";
import type {
  ApiTransaction,
  ApiTransactionSummary,
  PaginatedTransactions,
  TransactionFilters,
} from "../types/models";

// ─── Raw backend shapes ───────────────────────────────────────────────────────
interface RawTransactionItem {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  merchantName: string | null;
  paymentMethod: string | null;
  type: "income" | "expense";
  amountIdr: number;
  transactionDate: string; // ISO string
  notes: string | null;
  source: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
    kind: "income" | "expense";
    color: string | null;
    icon: string | null;
  };
}

interface RawTransactionList {
  items: RawTransactionItem[];
  total: number;
  page: number;
  limit: number;
}

interface RawSummary {
  incomeTotalIdr: number;
  expenseTotalIdr: number;
  netTotalIdr: number;
  transactionCount: number;
}

type SummaryFilters = Pick<TransactionFilters, "startDate" | "endDate">;

// ─── Create payload the backend actually expects ───────────────────────────────
export interface TransactionPayload {
  amountIdr: number;
  categoryId: string;
  type: "income" | "expense";
  merchantName?: string;
  paymentMethod?: string;
  notes?: string;
  transactionDate: string; // ISO 8601 string
  title: string;
}

function toApiTransaction(raw: RawTransactionItem): ApiTransaction {
  return {
    id: raw.id,
    title: raw.title,
    amount: raw.amountIdr,
    note: raw.notes ?? undefined,
    merchantName: raw.merchantName ?? undefined,
    paymentMethod: raw.paymentMethod ?? undefined,
    date: raw.transactionDate,
    type: raw.type,
    category: {
      id: raw.category.id,
      name: raw.category.name,
      kind: raw.category.kind ?? raw.type,
      icon: raw.category.icon ?? undefined,
    },
    userId: raw.userId,
  };
}

function buildCreatePayload(p: TransactionPayload) {
  return p;
}

function toDateTimeWithOffset(date: string, time: string): string {
  return `${date}T${time}+07:00`;
}

function addDateRangeParams(params: URLSearchParams, filters: SummaryFilters) {
  if (filters.startDate) {
    params.set("from", toDateTimeWithOffset(filters.startDate, "00:00:00.000"));
  }
  if (filters.endDate) {
    params.set("to", toDateTimeWithOffset(filters.endDate, "23:59:59.999"));
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────
export const transactionService = {
  async getTransactions(
    filters: TransactionFilters = {},
  ): Promise<PaginatedTransactions> {
    // Map frontend filter keys to backend query params
    const params = new URLSearchParams();
    if (filters.type) params.set("type", filters.type);
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.search?.trim()) params.set("search", filters.search.trim());
    if (filters.sort) params.set("sort", filters.sort);
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    addDateRangeParams(params, filters);

    const raw = await apiRequest<RawTransactionList>(`/transactions?${params}`);

    return {
      data: raw.items.map(toApiTransaction),
      total: raw.total,
      page: raw.page,
      limit: raw.limit,
      totalPages: Math.ceil(raw.total / raw.limit),
    };
  },

  async createTransaction(
    payload: TransactionPayload,
  ): Promise<ApiTransaction> {
    const backendPayload = buildCreatePayload(payload);
    const raw = await apiRequest<RawTransactionItem>("/transactions", {
      method: "POST",
      body: JSON.stringify(backendPayload),
    });
    return toApiTransaction(raw);
  },

  async getTransaction(id: string): Promise<ApiTransaction> {
    const raw = await apiRequest<RawTransactionItem>(`/transactions/${id}`);
    return toApiTransaction(raw);
  },

  async updateTransaction(
    id: string,
    payload: TransactionPayload,
  ): Promise<ApiTransaction> {
    const raw = await apiRequest<RawTransactionItem>(`/transactions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return toApiTransaction(raw);
  },

  async deleteTransaction(id: string): Promise<void> {
    return apiRequest<void>(`/transactions/${id}`, { method: "DELETE" });
  },

  async getSummary(
    filters: SummaryFilters = {},
  ): Promise<ApiTransactionSummary> {
    const params = new URLSearchParams();
    addDateRangeParams(params, filters);
    const query = params.toString();
    const raw = await apiRequest<RawSummary>(
      query ? `/transactions/summary?${query}` : "/transactions/summary",
    );
    return {
      totalIncome: raw.incomeTotalIdr,
      totalExpense: raw.expenseTotalIdr,
      netBalance: raw.netTotalIdr,
    };
  },
};
