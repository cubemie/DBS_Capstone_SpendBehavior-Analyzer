import { ArrowDown, ArrowRight, ArrowUp, Bell, Trophy, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import quokkaImg from "../assets/budu-logo.png";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Card from "../components/Card";
import ErrorState from "../components/ErrorState";
import PageHeader from "../components/PageHeader";
import ProgressBar from "../components/ProgressBar";
import TransactionItem from "../components/TransactionItem";
import { formatCurrency } from "../utils/formatCurrency";
import { useApi } from "../hooks/useApi";
import { analyticsService } from "../services/analyticsService";
import { useAuth } from "../contexts/AuthContext";
import type { ApiTransaction } from "../types/models";
import { ShoppingBag, UtensilsCrossed, Car, Banknote, CreditCard } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Map category name → lucide icon (best-effort, fallback ke Wallet)
function categoryIcon(name: string): LucideIcon {
  const lower = name.toLowerCase();
  if (lower.includes("makan") || lower.includes("food")) return UtensilsCrossed;
  if (lower.includes("transport") || lower.includes("kend")) return Car;
  if (lower.includes("belanja") || lower.includes("shop")) return ShoppingBag;
  if (lower.includes("gaji") || lower.includes("income") || lower.includes("pendapatan")) return Banknote;
  if (lower.includes("hiburan") || lower.includes("entertain")) return CreditCard;
  return Wallet;
}

// Adapter: ApiTransaction → shape expected by existing TransactionItem component
function toTransactionItem(tx: ApiTransaction) {
  const Icon = categoryIcon(tx.category.name);
  return {
    id: tx.id,
    title: tx.note ?? tx.category.name,
    merchant: tx.category.name,
    method: "",
    category: tx.category.name,
    type: tx.type as "income" | "expense",
    amount: Math.abs(tx.amount),
    date: tx.date,
    icon: Icon,
    accent: (tx.type === "income" ? "teal" : "coral") as "teal" | "coral",
  };
}

// Skeleton placeholders
function DashboardSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-48 rounded-3xl bg-[var(--color-soft)]" />
      <div className="h-40 rounded-3xl bg-[var(--color-soft)]" />
      <div className="h-40 rounded-3xl bg-[var(--color-soft)]" />
    </div>
  );
}

const CATEGORY_COLORS = ["#8BDFDD", "#F28C6A", "#FFE394", "#B7D6A5", "#C4B5FD"];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading, error } = useApi(() => analyticsService.getDashboard());

  if (isLoading) return <div className="space-y-6"><PageHeader title="Dashboard" description="Pantau pengeluaranmu bulan ini." /><DashboardSkeleton /></div>;
  if (error) return <div className="space-y-6"><PageHeader title="Dashboard" description="Pantau pengeluaranmu bulan ini." /><ErrorState message={error} /></div>;

  const { summary, topCategories, recentTransactions, warnings, moneyLeaks } = data!;
  const recentMapped = recentTransactions.slice(0, 3).map(toTransactionItem);

  const displayWarning =
    warnings && warnings.length > 0
      ? { title: warnings[0].message, description: warnings[0].message }
      : { title: "Belum ada peringatan.", description: "Terus pantau pengeluaran harianmu." };

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Pantau pengeluaranmu bulan ini." />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)]">
        <div className="min-w-0 space-y-5">
          <Card className="overflow-hidden bg-[linear-gradient(135deg,#FFFFFF_0%,#FFF8E4_100%)]">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-black text-[var(--color-text-secondary)]">Kondisi bulan ini</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
                  {formatCurrency(summary.netBalance)}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--color-text-secondary)]">
                  Selisih pemasukan dan pengeluaran bulan ini.
                </p>
              </div>
              <img
                src={quokkaImg}
                alt="Mascot BUDU"
                className="hidden h-24 w-24 rounded-[2rem] object-cover object-top sm:block"
              />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/80 p-4">
                <div className="flex items-center gap-2 text-[var(--color-teal-ink)]">
                  <ArrowDown className="h-4 w-4" />
                  <span className="text-xs font-black uppercase tracking-[0.12em]">Masuk</span>
                </div>
                <p className="mt-2 text-lg font-black text-[var(--color-text-primary)]">
                  {formatCurrency(summary.totalIncome, true)}
                </p>
              </div>
              <div className="rounded-2xl bg-white/80 p-4">
                <div className="flex items-center gap-2 text-[var(--color-salmon-dark)]">
                  <ArrowUp className="h-4 w-4" />
                  <span className="text-xs font-black uppercase tracking-[0.12em]">Keluar</span>
                </div>
                <p className="mt-2 text-lg font-black text-[var(--color-text-primary)]">
                  {formatCurrency(summary.totalExpense, true)}
                </p>
              </div>
              <div className="rounded-2xl bg-white/80 p-4">
                <div className="flex items-center gap-2 text-[var(--color-yellow-ink)]">
                  <Wallet className="h-4 w-4" />
                  <span className="text-xs font-black uppercase tracking-[0.12em]">Kategori</span>
                </div>
                <p className="mt-2 text-lg font-black text-[var(--color-text-primary)]">
                  {topCategories.length} aktif
                </p>
              </div>
            </div>
          </Card>

          {/* Top Categories — replaces Budget Bulanan */}
          <Card>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-[var(--color-text-primary)]">Top Kategori</h2>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">Pengeluaran terbesar bulan ini.</p>
              </div>
              <Badge variant="neutral">Bulan Ini</Badge>
            </div>
            <div className="space-y-5">
              {topCategories.slice(0, 3).map((cat, i) => (
                <div key={cat.categoryId}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-[var(--color-text-primary)]">{cat.categoryName}</p>
                    <p className="text-sm font-bold text-[var(--color-text-secondary)]">
                      {formatCurrency(cat.total, true)} · {cat.percentage}%
                    </p>
                  </div>
                  <ProgressBar value={cat.percentage} max={100} color={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                </div>
              ))}
              {topCategories.length === 0 && (
                <p className="text-sm text-[var(--color-text-muted)]">Belum ada data kategori.</p>
              )}
            </div>
          </Card>

          <Card>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-[var(--color-text-primary)]">Aktivitas Terbaru</h2>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">3 transaksi terakhir.</p>
              </div>
              <Button variant="ghost" buttonSize="sm" iconRight={<ArrowRight className="h-4 w-4" />} onClick={() => navigate("/riwayat")}>
                Riwayat
              </Button>
            </div>
            <div className="space-y-4">
              {recentMapped.length === 0
                ? <p className="text-sm text-[var(--color-text-muted)]">Belum ada transaksi.</p>
                : recentMapped.map((transaction) => (
                  <TransactionItem key={transaction.id} transaction={transaction} compact />
                ))}
            </div>
          </Card>
        </div>

        <aside className="min-w-0 space-y-5">
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Vibe kamu</p>
                <h2 className="mt-2 text-2xl font-black leading-tight text-[var(--color-text-primary)]">
                  {user?.name?.split(" ")[0] ?? "BUDU User"}
                </h2>
              </div>
              <Badge variant="teal" icon={<Trophy className="h-3.5 w-3.5" />}>
                Stabil
              </Badge>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
              {moneyLeaks && moneyLeaks.length > 0
                ? `Terdeteksi ${moneyLeaks.length} potensi kebocoran. Cek halaman peringatan.`
                : "Pilihanmu cukup rapi. Tetap beri batas untuk jajan impulsif."}
            </p>
            <Button variant="outline" fullWidth className="mt-5" onClick={() => navigate("/profil")}>Lihat Profil</Button>
          </Card>

          <Card className="!border-[var(--color-salmon-light)] !bg-[var(--color-salmon-bg)]">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--color-salmon-dark)]">
                <Bell className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--color-salmon-dark)]">Perlu dicek</p>
                <h2 className="mt-2 text-xl font-black leading-tight text-[var(--color-text-primary)]">
                  {displayWarning.title}
                </h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
              {displayWarning.description}
            </p>
            <Button fullWidth className="mt-5" onClick={() => navigate("/peringatan")}>Lihat Peringatan</Button>
          </Card>
        </aside>
      </section>
    </div>
  );
}

