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

// ─── Create payload the backend actually expects ───────────────────────────────
export interface TransactionPayload {
  amountIdr: number;
  categoryId: string;
  type: "income" | "expense";
  notes?: string;
  transactionDate: string; // ISO 8601 string
  title: string;
}

function toApiTransaction(raw: RawTransactionItem): ApiTransaction {
  return {
    id: raw.id,
    amount: raw.amountIdr,
    note: raw.notes ?? raw.title,
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

// ─── Service ──────────────────────────────────────────────────────────────────
export const transactionService = {
  async getTransactions(
    filters: TransactionFilters = {},
  ): Promise<PaginatedTransactions> {
    // Map frontend filter keys to backend query params
    const params = new URLSearchParams();
    if (filters.type) params.set("type", filters.type);
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));

    const raw = await apiRequest<RawTransactionList>(
      `/transactions?${params}`,
    );

    return {
      data: raw.items.map(toApiTransaction),
      total: raw.total,
      page: raw.page,
      limit: raw.limit,
      totalPages: Math.ceil(raw.total / raw.limit),
    };
  },

  async createTransaction(payload: TransactionPayload): Promise<ApiTransaction> {
    const backendPayload = buildCreatePayload(payload);
    const raw = await apiRequest<RawTransactionItem>("/transactions", {
      method: "POST",
      body: JSON.stringify(backendPayload),
    });
    return toApiTransaction(raw);
  },

  async deleteTransaction(id: string): Promise<void> {
    return apiRequest<void>(`/transactions/${id}`, { method: "DELETE" });
  },

  async getSummary(): Promise<ApiTransactionSummary> {
    const raw = await apiRequest<RawSummary>("/transactions/summary");
    return {
      totalIncome: raw.incomeTotalIdr,
      totalExpense: raw.expenseTotalIdr,
      netBalance: raw.netTotalIdr,
    };
  },
};
