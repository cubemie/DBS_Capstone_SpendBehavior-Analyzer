import { useCallback, useEffect } from "react";
import { ArrowDown, ArrowRight, ArrowUp, Bell, CalendarClock, Trophy, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import quokkaImg from "../assets/budu-logo.png";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Card from "../components/Card";
import ErrorState from "../components/ErrorState";
import PageHeader from "../components/PageHeader";
import PredictionStatusCard from "../components/PredictionStatusCard";
import ProgressBar from "../components/ProgressBar";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate, formatTime } from "../utils/formatDate";
import { useApi } from "../hooks/useApi";
import { analyticsService } from "../services/analyticsService";
import { useAuth } from "../hooks/useAuth";
import { usePredictionRefresh } from "../hooks/usePredictionRefresh";
import { cn } from "../utils/cn";
import { getCategoryIcon } from "../utils/categoryIcon";
import { buildExpenseFilterSearch } from "../utils/transactionFilterLinks";

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
  const { user, setPredictionPersona } = useAuth();
  const fetchDashboard = useCallback(() => analyticsService.getDashboard(), []);
  const { data, isLoading, error, refetch } = useApi(fetchDashboard);
  const {
    refreshAnalysis,
    goToAddTransaction,
    isRefreshing,
    refreshError,
  } = usePredictionRefresh(refetch);

  useEffect(() => {
    if (!data) return;
    setPredictionPersona(data.persona?.persona ?? null);
  }, [data, setPredictionPersona]);

  if (isLoading) return <div className="space-y-6"><PageHeader title="Dashboard" description="Pantau pengeluaranmu bulan ini." /><DashboardSkeleton /></div>;
  if (error) return <div className="space-y-6"><PageHeader title="Dashboard" description="Pantau pengeluaranmu bulan ini." /><ErrorState message={error} /></div>;

  const { summary, persona, predictionStatus, topCategories, recentTransactions, warnings, moneyLeaks } = data!;
  const recentPreview = recentTransactions.slice(0, 3);
  const hasWarnings = warnings && warnings.length > 0;
  const hasMoneyLeaks = moneyLeaks.length > 0;
  const primaryMoneyLeak = moneyLeaks[0];

  const displayWarning =
    hasWarnings
      ? { title: warnings[0].title, description: warnings[0].description }
      : {
          title: "Tidak ada peringatan aktif.",
          description: "Belum ada sinyal pengeluaran yang perlu ditindaklanjuti untuk periode ini.",
        };

  const goToLeakTransactions = () => {
    if (!primaryMoneyLeak) return;

    navigate(`/riwayat?${buildExpenseFilterSearch(data!.period, primaryMoneyLeak.categoryId)}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Pantau pengeluaranmu bulan ini." />

      <section className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
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
                className="hidden h-24 w-24 rounded-[2rem] object-cover object-center sm:block"
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

          <Card className={hasWarnings ? "!border-[var(--color-salmon-light)] !bg-[var(--color-salmon-bg)]" : ""}>
            <div className="flex items-start gap-4">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white ${hasWarnings ? "text-[var(--color-salmon-dark)]" : "text-[var(--color-teal-ink)]"}`}>
                <Bell className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className={`text-xs font-black uppercase tracking-[0.14em] ${hasWarnings ? "text-[var(--color-salmon-dark)]" : "text-[var(--color-text-muted)]"}`}>
                  {hasWarnings ? "Perlu dicek" : "Status peringatan"}
                </p>
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

          {hasMoneyLeaks && primaryMoneyLeak ? (
            <Card className="!border-[var(--color-yellow)] !bg-[var(--color-yellow-bg)]">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--color-yellow-ink)]">
                  <CalendarClock className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--color-yellow-ink)]">
                    Deteksi kebocoran
                  </p>
                  <h2 className="mt-2 text-xl font-black leading-tight text-[var(--color-text-primary)]">
                    {primaryMoneyLeak.title}
                  </h2>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
                {primaryMoneyLeak.description}
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={goToLeakTransactions}
                >
                  Lihat Transaksi
                </Button>
                <Button fullWidth onClick={() => navigate("/peringatan")}>
                  Detail Kebocoran
                </Button>
              </div>
            </Card>
          ) : null}

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
              {recentPreview.length === 0
                ? <p className="text-sm text-[var(--color-text-muted)]">Belum ada transaksi.</p>
                : recentPreview.map((transaction) => {
                  const Icon = getCategoryIcon(transaction.category.name);
                  const isIncome = transaction.type === "income";

                  return (
                    <article key={transaction.id} className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                          isIncome
                            ? "bg-[var(--color-teal-bg)] text-[var(--color-teal-ink)]"
                            : "bg-[var(--color-salmon-bg)] text-[var(--color-salmon-dark)]",
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold text-[var(--color-text-primary)]">
                              {transaction.note ?? transaction.title}
                            </h3>
                            <p className="mt-0.5 truncate text-xs text-[var(--color-text-muted)]">
                              {transaction.paymentMethod ?? transaction.category.name} - {formatDate(transaction.date)} {formatTime(transaction.date)}
                            </p>
                          </div>
                          <p
                            className={cn(
                              "shrink-0 text-sm font-black",
                              isIncome ? "text-[var(--color-green)]" : "text-[var(--color-red)]",
                            )}
                          >
                            {isIncome ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
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
              <Badge
                variant={persona ? "teal" : "neutral"}
                icon={persona ? <Trophy className="h-3.5 w-3.5" /> : undefined}
              >
                {persona?.persona ?? "Belum ada persona"}
              </Badge>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
              {persona
                ? `Persona terbaru: ${persona.persona}.`
                : "Belum ada hasil prediksi persona. Jalankan analisis di halaman profil."}
            </p>
            <Button variant="outline" fullWidth className="mt-5" onClick={() => navigate("/profil")}>Lihat Profil</Button>
          </Card>

          <PredictionStatusCard
            status={predictionStatus}
            persona={persona}
            onRefresh={refreshAnalysis}
            onAddTransaction={goToAddTransaction}
            isRefreshing={isRefreshing}
            error={refreshError}
          />

        </aside>
      </section>
    </div>
  );
}
