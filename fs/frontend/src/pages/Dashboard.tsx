import { ArrowDown, ArrowRight, ArrowUp, Bell, Trophy, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import quokkaImg from "../assets/quokka-dashboard.png";
import { budgets, currentUser, monthlySummary, transactions, warnings } from "../services/mockData";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Card from "../components/Card";
import PageHeader from "../components/PageHeader";
import ProgressBar from "../components/ProgressBar";
import TransactionItem from "../components/TransactionItem";
import { formatCurrency } from "../utils/formatCurrency";

export default function Dashboard() {
  const navigate = useNavigate();
  const recentTransactions = transactions.slice(0, 3);
  const primaryWarning = warnings[0];
  const totalBudgetUsed = budgets.reduce((total, budget) => total + budget.used, 0);
  const totalBudgetLimit = budgets.reduce((total, budget) => total + budget.limit, 0);
  const budgetPercent = Math.round((totalBudgetUsed / totalBudgetLimit) * 100);

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
                  {formatCurrency(monthlySummary.balance)}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--color-text-secondary)]">
                  Pengeluaran masih terkendali. Kamu lebih hemat {monthlySummary.savingRate}% dari rata-rata.
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
                  {formatCurrency(monthlySummary.income, true)}
                </p>
              </div>
              <div className="rounded-2xl bg-white/80 p-4">
                <div className="flex items-center gap-2 text-[var(--color-salmon-dark)]">
                  <ArrowUp className="h-4 w-4" />
                  <span className="text-xs font-black uppercase tracking-[0.12em]">Keluar</span>
                </div>
                <p className="mt-2 text-lg font-black text-[var(--color-text-primary)]">
                  {formatCurrency(monthlySummary.expense, true)}
                </p>
              </div>
              <div className="rounded-2xl bg-white/80 p-4">
                <div className="flex items-center gap-2 text-[var(--color-yellow-ink)]">
                  <Wallet className="h-4 w-4" />
                  <span className="text-xs font-black uppercase tracking-[0.12em]">Budget</span>
                </div>
                <p className="mt-2 text-lg font-black text-[var(--color-text-primary)]">{budgetPercent}% terpakai</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-[var(--color-text-primary)]">Budget Bulanan</h2>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">Kategori utama saja.</p>
              </div>
              <Badge variant="neutral">Mei</Badge>
            </div>
            <div className="space-y-5">
              {budgets.map((budget) => {
                const isOver = budget.used > budget.limit;
                return (
                  <div key={budget.id}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-[var(--color-text-primary)]">{budget.category}</p>
                      <p className={isOver ? "text-sm font-black text-[var(--color-salmon-dark)]" : "text-sm font-bold text-[var(--color-text-secondary)]"}>
                        {formatCurrency(budget.used, true)} / {formatCurrency(budget.limit, true)}
                      </p>
                    </div>
                    <ProgressBar value={budget.used} max={budget.limit} color={budget.color} />
                  </div>
                );
              })}
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
              {recentTransactions.map((transaction) => (
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
                  {currentUser.persona}
                </h2>
              </div>
              <Badge variant="teal" icon={<Trophy className="h-3.5 w-3.5" />}>
                Stabil
              </Badge>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
              Pilihanmu cukup rapi minggu ini. Tetap beri batas untuk jajan impulsif.
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
                <h2 className="mt-2 text-xl font-black leading-tight text-[var(--color-text-primary)]">{primaryWarning.title}</h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
              Kopi naik minggu ini. Cek detailnya biar budget tetap santai.
            </p>
            <Button fullWidth className="mt-5" onClick={() => navigate("/peringatan")}>Lihat Peringatan</Button>
          </Card>
        </aside>
      </section>
    </div>
  );
}
