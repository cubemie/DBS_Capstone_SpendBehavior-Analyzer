import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Search, Wallet } from "lucide-react";
import Badge from "../components/Badge";
import Card from "../components/Card";
import Input from "../components/Input";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import TransactionItem from "../components/TransactionItem";
import { monthlySummary, transactions } from "../services/mockData";
import { cn } from "../utils/cn";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate, formatTime } from "../utils/formatDate";

export default function RiwayatTransaksi() {
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [search, setSearch] = useState("");

  const categories = useMemo(
    () => ["Semua", ...Array.from(new Set(transactions.map((transaction) => transaction.category)))],
    [],
  );

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesCategory = activeFilter === "Semua" || transaction.category === activeFilter;
    const query = search.toLowerCase();
    const matchesSearch =
      transaction.title.toLowerCase().includes(query) ||
      transaction.merchant.toLowerCase().includes(query) ||
      transaction.category.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Riwayat Transaksi" description="Lihat arus uang bulan ini." />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total Saldo"
          value={formatCurrency(monthlySummary.balance)}
          helper="Mei 2026"
          tone="neutral"
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          label="Pemasukan"
          value={formatCurrency(monthlySummary.income)}
          tone="teal"
          icon={<ArrowDown className="h-5 w-5" />}
        />
        <StatCard
          label="Pengeluaran"
          value={formatCurrency(monthlySummary.expense)}
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
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveFilter(category)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition",
                  activeFilter === category
                    ? "border-[var(--color-teal-dark)] bg-[var(--color-teal)] text-[var(--color-teal-ink)]"
                    : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-teal-dark)]",
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <section className="space-y-3 lg:hidden">
        {filteredTransactions.map((transaction) => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))}
      </section>

      <Card className="hidden overflow-hidden lg:block" padded={false}>
        <div className="grid grid-cols-[120px_minmax(260px,1fr)_160px_160px] border-b border-[var(--color-border)] bg-white px-5 py-4 text-sm font-black text-[var(--color-text-secondary)]">
          <span>Tanggal</span>
          <span>Deskripsi</span>
          <span>Kategori</span>
          <span className="text-right">Jumlah</span>
        </div>

        {filteredTransactions.map((transaction) => {
          const Icon = transaction.icon;
          const isIncome = transaction.type === "income";
          return (
            <div
              key={transaction.id}
              className="grid grid-cols-[120px_minmax(260px,1fr)_160px_160px] items-center border-b border-[var(--color-border)] px-5 py-5 last:border-0"
            >
              <div>
                <p className="font-bold text-[var(--color-text-primary)]">{formatDate(transaction.date)}</p>
                <p className="text-sm text-[var(--color-text-muted)]">{formatTime(transaction.date)}</p>
              </div>
              <div className="flex min-w-0 items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-soft)] text-[var(--color-text-secondary)]">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-black text-[var(--color-text-primary)]">{transaction.title}</p>
                  <p className="truncate text-sm text-[var(--color-text-muted)]">{transaction.method} - {transaction.merchant}</p>
                </div>
              </div>
              <Badge variant={isIncome ? "teal" : "neutral"} className="w-fit">
                {transaction.category}
              </Badge>
              <p className={cn("text-right font-black", isIncome ? "text-[var(--color-green)]" : "text-[var(--color-red)]")}>
                {isIncome ? "+" : "-"} {formatCurrency(transaction.amount)}
              </p>
            </div>
          );
        })}

        <div className="bg-white px-5 py-4">
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">
            Menampilkan {filteredTransactions.length} transaksi
          </p>
        </div>
      </Card>
    </div>
  );
}
