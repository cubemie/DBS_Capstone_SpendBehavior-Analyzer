import { ArrowRight, MoreHorizontal, Plus, RefreshCw, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import quokkaImg from "../assets/quokka-dashboard.png";
import {
  budgets,
  insights,
  moneyLeaks,
  monthlySummary,
  quickActions,
  spendingRhythm,
  transactions,
  warnings,
} from "../services/mockData";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Card from "../components/Card";
import InsightCard from "../components/InsightCard";
import ProgressBar from "../components/ProgressBar";
import SectionHeader from "../components/SectionHeader";
import TransactionItem from "../components/TransactionItem";
import { formatCurrency } from "../utils/formatCurrency";

export default function Dashboard() {
  const navigate = useNavigate();
  const maxRhythm = Math.max(...spendingRhythm.map((item) => item.amount));
  const recentTransactions = transactions.slice(0, 3);
  const primaryLeak = moneyLeaks[0];
  const primaryWarning = warnings[0];

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Financial oasis"
        title="Dashboard"
        description="Selamat datang kembali. Quokka sudah merapikan sinyal penting dari pengeluaran bulan ini."
        action={
          <Button iconLeft={<Plus className="h-5 w-5" />} onClick={() => navigate("/tambah")}>
            Tambah Transaksi
          </Button>
        }
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-[1fr_1fr_320px]">
        <div className="min-w-0 space-y-5">
          <Card className="relative min-h-[256px] overflow-hidden">
            <div className="relative z-10 flex h-full flex-col justify-between gap-8">
              <div>
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                      Your vibe
                    </p>
                    <h2 className="mt-2 text-2xl font-black leading-tight text-[var(--color-text-primary)] sm:text-3xl">
                      Rational Spender
                    </h2>
                  </div>
                  <Badge variant="teal" className="self-start" icon={<Trophy className="h-3.5 w-3.5" />}>
                    Top 15%
                  </Badge>
                </div>
                <p className="mt-4 max-w-sm text-base leading-7 text-[var(--color-text-secondary)]">
                  Anda membuat keputusan yang solid minggu ini. Pertahankan energi logis itu, sambil tetap memberi ruang untuk reward kecil.
                </p>
              </div>
              <div className="flex items-end justify-between gap-4">
                <Button variant="outline" iconRight={<ArrowRight className="h-4 w-4" />} onClick={() => navigate("/profil")}>
                  Lihat Persona
                </Button>
                <img
                  src={quokkaImg}
                  alt="Quokka"
                  className="h-24 w-24 shrink-0 rounded-[2rem] object-cover object-top sm:h-28 sm:w-28"
                />
              </div>
            </div>
          </Card>

          <Card>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-[var(--color-text-primary)]">Aktivitas Terbaru</h2>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">Transaksi yang paling baru masuk.</p>
              </div>
              <Button variant="ghost" buttonSize="sm" onClick={() => navigate("/riwayat")}>
                Lihat semua
              </Button>
            </div>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} compact />
              ))}
            </div>
          </Card>
        </div>

        <div className="min-w-0 space-y-5">
          <Card className="min-h-[256px]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                  Spending rhythm
                </p>
                <h2 className="mt-2 text-2xl font-black text-[var(--color-text-primary)]">Ritme Mingguan</h2>
              </div>
              <button
                type="button"
                aria-label="Opsi ritme belanja"
                className="flex h-9 w-9 items-center justify-center rounded-2xl text-[var(--color-text-muted)] hover:bg-[var(--color-soft)]"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
            <div className="grid h-36 grid-cols-7 items-end gap-2">
              {spendingRhythm.map((item) => {
                const height = `${Math.max((item.amount / maxRhythm) * 100, 18)}%`;
                const isWeekend = item.day === "Sab" || item.day === "Min";
                return (
                  <div key={item.day} className="flex h-full flex-col items-center justify-end gap-2">
                    <div
                      className={isWeekend ? "w-full rounded-t-2xl bg-[var(--color-salmon)]" : "w-full rounded-t-2xl bg-[var(--color-teal)]"}
                      style={{ height }}
                    />
                    <span className={isWeekend ? "text-xs font-black text-[var(--color-salmon-dark)]" : "text-xs font-bold text-[var(--color-text-muted)]"}>
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-[var(--color-text-primary)]">Budget Bulanan</h2>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">Batas aman untuk kategori utama.</p>
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
        </div>

        <aside className="min-w-0 space-y-5 xl:col-span-1">
          <Card>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
              Quick actions
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => navigate(action.path)}
                    className="flex min-h-28 flex-col items-center justify-center gap-3 rounded-3xl border border-[var(--color-border)] bg-white px-3 text-sm font-black text-[var(--color-text-primary)] transition hover:border-[var(--color-teal-dark)] hover:bg-[var(--color-teal-bg)]"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-soft)] text-[var(--color-teal-ink)]">
                      <Icon className="h-6 w-6" />
                    </span>
                    {action.label}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="!border-[var(--color-salmon-light)] !bg-[var(--color-salmon-bg)]">
            <div className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-salmon-light)] text-[var(--color-salmon-dark)]">
                <RefreshCw className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[var(--color-text-primary)]">{primaryWarning.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                  Pengeluaran kopi naik 40% dari minggu lalu. Coba brewing di rumah besok?
                </p>
              </div>
            </div>
          </Card>

          <Card className="!border-[var(--color-teal)] !bg-[var(--color-teal)] !text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-white/80">Leak detected</p>
                <h2 className="mt-2 text-3xl font-black leading-tight">Kebocoran kecil ditemukan</h2>
              </div>
              <Badge variant="teal" className="bg-white/25 text-white">
                ~{formatCurrency(monthlySummary.leakEstimate, true)}/bln
              </Badge>
            </div>
            <p className="mt-5 text-sm leading-6 text-white/85">{primaryLeak.description}</p>
            <Button variant="outline" fullWidth className="mt-6 border-white bg-white text-[var(--color-teal-ink)]">
              Review Langganan
            </Button>
          </Card>
        </aside>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </section>
    </div>
  );
}
