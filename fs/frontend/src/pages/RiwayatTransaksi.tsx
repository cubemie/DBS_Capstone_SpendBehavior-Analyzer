import { useState, useEffect, useRef } from "react";
import {
  ArrowDown,
  ArrowUp,
  Pencil,
  Search,
  Wallet,
  Trash2,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Card from "../components/Card";
import ErrorState from "../components/ErrorState";
import Input from "../components/Input";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { useApi } from "../hooks/useApi";
import { transactionService } from "../services/transactionService";
import { cn } from "../utils/cn";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate, formatTime } from "../utils/formatDate";
import type { CategoryKind, TransactionFilters } from "../types/models";
import {
  ShoppingBag,
  UtensilsCrossed,
  Car,
  Banknote,
  CreditCard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const DEFAULT_FILTERS: TransactionFilters = {
  page: 1,
  limit: 10,
  sort: "date_desc",
};

function categoryIcon(name: string): LucideIcon {
  const lower = name.toLowerCase();
  if (lower.includes("makan") || lower.includes("food")) return UtensilsCrossed;
  if (lower.includes("transport")) return Car;
  if (lower.includes("belanja") || lower.includes("shop")) return ShoppingBag;
  if (lower.includes("gaji") || lower.includes("pendapatan")) return Banknote;
  if (lower.includes("hiburan")) return CreditCard;
  return Wallet;
}

// Skeleton for transaction list
function TransactionListSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 rounded-2xl bg-[var(--color-soft)]" />
      ))}
    </div>
  );
}

function getTransactionTitle(tx: {
  title: string;
  note?: string;
  category: { name: string };
}): string {
  return tx.note ?? tx.title ?? tx.category.name;
}

function getTransactionMeta(tx: {
  merchantName?: string;
  paymentMethod?: string;
  category: { name: string };
}): string {
  return (
    [tx.merchantName, tx.paymentMethod].filter(Boolean).join(" · ") ||
    tx.category.name
  );
}

function isCategoryKind(value: string | null): value is CategoryKind {
  return value === "income" || value === "expense";
}

function isSort(
  value: string | null,
): value is NonNullable<TransactionFilters["sort"]> {
  return value === "date_desc" || value === "date_asc";
}

function isUuid(value: string | null): value is string {
  return (
    !!value &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

function readPositiveNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function readDate(value: string | null): string | undefined {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

function filtersFromSearch(searchString: string): TransactionFilters {
  const params = new URLSearchParams(searchString);
  const filters: TransactionFilters = { ...DEFAULT_FILTERS };
  const type = params.get("type");
  const sort = params.get("sort");
  const categoryId = params.get("categoryId");
  const page = readPositiveNumber(params.get("page"));
  const limit = readPositiveNumber(params.get("limit"));
  const search = params.get("search")?.trim();
  const startDate = readDate(params.get("startDate"));
  const endDate = readDate(params.get("endDate"));

  if (isCategoryKind(type)) filters.type = type;
  if (isUuid(categoryId)) filters.categoryId = categoryId;
  if (search) filters.search = search;
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;
  if (isSort(sort)) filters.sort = sort;
  if (page) filters.page = page;
  if (limit) filters.limit = Math.min(limit, 100);

  return filters;
}

function hasUrlFilters(searchString: string): boolean {
  const params = new URLSearchParams(searchString);
  return ["type", "categoryId", "search", "startDate", "endDate", "sort"].some(
    (key) => params.has(key),
  );
}

export default function RiwayatTransaksi() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setPredictionPersona } = useAuth();
  const initialFilters = filtersFromSearch(location.search);
  const lastSearchRef = useRef(location.search);
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters);
  const [search, setSearch] = useState(initialFilters.search ?? "");
  const [activeTypeFilter, setActiveTypeFilter] = useState<
    "all" | CategoryKind
  >(initialFilters.type ?? "all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(
    location.state?.toast || null,
  );

  useEffect(() => {
    if (lastSearchRef.current === location.search) return;
    lastSearchRef.current = location.search;

    const nextFilters = filtersFromSearch(location.search);
    setFilters(nextFilters);
    setSearch(nextFilters.search ?? "");
    setActiveTypeFilter(nextFilters.type ?? "all");
  }, [location.search]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      window.history.replaceState({}, document.title);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextSearch = search.trim() || undefined;
      setFilters((prev) => {
        if (prev.search === nextSearch) return prev;
        return { ...prev, search: nextSearch, page: 1 };
      });
    }, 350);

    return () => window.clearTimeout(timer);
  }, [search]);

  const {
    data: txData,
    isLoading: txLoading,
    error: txError,
    refetch: refetchTransactions,
  } = useApi(() => transactionService.getTransactions(filters), [filters]);
  const { data: summary, refetch: refetchSummary } = useApi(
    () => transactionService.getSummary(filters),
    [filters.startDate, filters.endDate],
  );

  const refetchTransactionData = () => {
    refetchTransactions();
    refetchSummary();
  };

  const handleTypeFilter = (newType: "all" | CategoryKind) => {
    setActiveTypeFilter(newType);
    setFilters((prev) => ({
      ...prev,
      type: newType === "all" ? undefined : newType,
      page: 1,
    }));
  };

  const handleDateFilter = (key: "startDate" | "endDate", value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }));
  };

  const handleSortChange = (sort: NonNullable<TransactionFilters["sort"]>) => {
    setFilters((prev) => ({
      ...prev,
      sort,
      page: 1,
    }));
  };

  const clearUrlFilters = () => {
    navigate(location.pathname, { replace: true });
    setFilters({ ...DEFAULT_FILTERS });
    setSearch("");
    setActiveTypeFilter("all");
  };

  const transactions = txData?.data ?? [];
  const hasActiveUrlFilters = hasUrlFilters(location.search);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await transactionService.deleteTransaction(deleteId);
      setPredictionPersona(null);
      setToastMessage("Transaksi berhasil dihapus.");
      refetchTransactionData();
    } catch {
      setToastMessage("Gagal menghapus transaksi.");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <Card className="max-w-sm w-full">
            <h2 className="text-lg font-black text-[var(--color-text-primary)]">
              Hapus Transaksi?
            </h2>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Aksi ini tidak bisa dibatalkan.
            </p>
            <div className="mt-5 flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                fullWidth
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Menghapus..." : "Hapus"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {toastMessage && (
        <div className="rounded-xl bg-[#e6f7f6] px-4 py-3 text-sm font-bold text-[#147a75]">
          {toastMessage}
        </div>
      )}
      <PageHeader
        title="Riwayat Transaksi"
        description="Lihat arus uang bulan ini."
      />

      {hasActiveUrlFilters ? (
        <div className="flex flex-col gap-3 rounded-xl bg-[#e6f7f6] px-4 py-3 text-sm text-[#147a75] sm:flex-row sm:items-center sm:justify-between">
          <p className="font-bold">
            Menampilkan transaksi sesuai filter dari halaman peringatan.
            {filters.categoryId
              ? " Kategori sudah dibatasi ke temuan yang dipilih."
              : ""}
          </p>
          <Button variant="outline" buttonSize="sm" onClick={clearUrlFilters}>
            Tampilkan Semua
          </Button>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Saldo"
          value={summary ? formatCurrency(summary.netBalance) : "—"}
          tone="neutral"
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          label="Pemasukan"
          value={summary ? formatCurrency(summary.totalIncome) : "—"}
          tone="teal"
          icon={<ArrowDown className="h-5 w-5" />}
        />
        <StatCard
          label="Pengeluaran"
          value={summary ? formatCurrency(summary.totalExpense) : "—"}
          tone="coral"
          icon={<ArrowUp className="h-5 w-5" />}
        />
      </section>

      <Card>
        <div className="grid gap-4 lg:grid-cols-[minmax(260px,1fr)_auto] lg:items-center">
          <Input
            name="search"
            placeholder="Cari transaksi..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            iconLeft={<Search className="h-5 w-5" />}
            className="rounded-full bg-white"
          />
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(["all", "expense", "income"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => handleTypeFilter(f)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition",
                  activeTypeFilter === f
                    ? "border-[var(--color-teal-dark)] bg-[var(--color-teal)] text-[var(--color-teal-ink)]"
                    : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-teal-dark)]",
                )}
              >
                {f === "all"
                  ? "Semua"
                  : f === "expense"
                    ? "Pengeluaran"
                    : "Pemasukan"}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_180px]">
          <Input
            label="Dari tanggal"
            name="startDate"
            type="date"
            value={filters.startDate ?? ""}
            onChange={(event) =>
              handleDateFilter("startDate", event.target.value)
            }
            className="bg-white"
          />
          <Input
            label="Sampai tanggal"
            name="endDate"
            type="date"
            value={filters.endDate ?? ""}
            onChange={(event) =>
              handleDateFilter("endDate", event.target.value)
            }
            className="bg-white"
          />
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--color-text-primary)]">
              Urutan
            </span>
            <select
              value={filters.sort ?? "date_desc"}
              onChange={(event) =>
                handleSortChange(
                  event.target.value as NonNullable<TransactionFilters["sort"]>,
                )
              }
              className="h-12 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 text-sm font-bold text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-teal-dark)] focus:ring-4 focus:ring-[var(--color-teal-bg)]"
            >
              <option value="date_desc">Terbaru</option>
              <option value="date_asc">Terlama</option>
            </select>
          </label>
        </div>
      </Card>

      {txLoading && <TransactionListSkeleton />}
      {txError && (
        <ErrorState message={txError} onRetry={refetchTransactions} />
      )}

      {!txLoading && !txError && (
        <>
          {/* Mobile list */}
          <section className="space-y-3 lg:hidden">
            {transactions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-10 text-center">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Belum ada transaksi.
                </p>
              </div>
            ) : (
              transactions.map((tx) => {
                const isIncome = tx.type === "income";
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white p-3"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-soft)] text-[var(--color-text-secondary)]">
                      {(() => {
                        const Icon = categoryIcon(tx.category.name);
                        return <Icon className="h-5 w-5" />;
                      })()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[var(--color-text-primary)]">
                        {getTransactionTitle(tx)}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {getTransactionMeta(tx)} · {formatDate(tx.date)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <p
                        className={cn(
                          "text-sm font-black",
                          isIncome
                            ? "text-[var(--color-green)]"
                            : "text-[var(--color-red)]",
                        )}
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(tx.amount)}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/transaksi/${tx.id}/edit`)}
                          className="text-[var(--color-text-muted)] hover:text-[var(--color-teal-ink)]"
                          aria-label="Edit transaksi"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(tx.id)}
                          className="text-[var(--color-text-muted)] hover:text-[var(--color-salmon-dark)]"
                          aria-label="Hapus transaksi"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </section>

          {/* Desktop table */}
          <Card className="hidden overflow-hidden lg:block" padded={false}>
            <div className="grid grid-cols-[120px_minmax(260px,1fr)_160px_160px_72px] border-b border-[var(--color-border)] bg-white px-5 py-4 text-sm font-black text-[var(--color-text-secondary)]">
              <span>Tanggal</span>
              <span>Catatan</span>
              <span>Kategori</span>
              <span className="text-right">Jumlah</span>
              <span></span>
            </div>

            {transactions.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Belum ada transaksi.
                </p>
              </div>
            ) : (
              transactions.map((tx) => {
                const Icon = categoryIcon(tx.category.name);
                const isIncome = tx.type === "income";
                return (
                  <div
                    key={tx.id}
                    className="grid grid-cols-[120px_minmax(260px,1fr)_160px_160px_72px] items-center border-b border-[var(--color-border)] px-5 py-5 last:border-0"
                  >
                    <div>
                      <p className="font-bold text-[var(--color-text-primary)]">
                        {formatDate(tx.date)}
                      </p>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        {formatTime(tx.date)}
                      </p>
                    </div>
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-soft)] text-[var(--color-text-secondary)]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <p className="truncate font-black text-[var(--color-text-primary)]">
                        {getTransactionTitle(tx)}
                      </p>
                      <p className="truncate text-sm text-[var(--color-text-muted)]">
                        {getTransactionMeta(tx)}
                      </p>
                    </div>
                    <Badge
                      variant={isIncome ? "teal" : "neutral"}
                      className="w-fit"
                    >
                      {tx.category.name}
                    </Badge>
                    <p
                      className={cn(
                        "text-right font-black",
                        isIncome
                          ? "text-[var(--color-green)]"
                          : "text-[var(--color-red)]",
                      )}
                    >
                      {isIncome ? "+" : "-"} {formatCurrency(tx.amount)}
                    </p>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/transaksi/${tx.id}/edit`)}
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-teal-ink)]"
                        aria-label="Edit transaksi"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(tx.id)}
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-salmon-dark)]"
                        aria-label="Hapus transaksi"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            <div className="bg-white px-5 py-4 flex items-center justify-between">
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                {transactions.length} dari {txData?.total ?? 0} transaksi
              </p>
              {txData && txData.totalPages > 1 && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={filters.page === 1}
                    onClick={() =>
                      setFilters((p) => ({ ...p, page: (p.page ?? 1) - 1 }))
                    }
                    className="rounded-xl border border-[var(--color-border)] px-3 py-1.5 text-sm font-bold disabled:opacity-40"
                  >
                    ← Prev
                  </button>
                  <span className="px-3 py-1.5 text-sm font-bold text-[var(--color-text-secondary)]">
                    {filters.page} / {txData.totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={filters.page === txData.totalPages}
                    onClick={() =>
                      setFilters((p) => ({ ...p, page: (p.page ?? 1) + 1 }))
                    }
                    className="rounded-xl border border-[var(--color-border)] px-3 py-1.5 text-sm font-bold disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
