import { useState } from "react";
import { BarChart3, ChevronDown, TrendingUp } from "lucide-react";
import Card from "../components/Card";
import ErrorState from "../components/ErrorState";
import PageHeader from "../components/PageHeader";
import ProgressBar from "../components/ProgressBar";
import { useApi } from "../hooks/useApi";
import { analyticsService } from "../services/analyticsService";
import type { DashboardPeriodOption } from "../services/analyticsService";
import { formatCurrency } from "../utils/formatCurrency";

const CHART_COLORS = ["#F28C6A", "#8BDFDD", "#FFE394", "#B7D6A5", "#C4B5FD"];

function AnalisisSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-80 rounded-3xl bg-[var(--color-soft)]" />
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="h-60 rounded-3xl bg-[var(--color-soft)]" />
        <div className="h-60 rounded-3xl bg-[var(--color-soft)]" />
      </div>
    </div>
  );
}

export default function Analisis() {
  const [period, setPeriod] = useState<DashboardPeriodOption>("current_month");
  const { data, isLoading, error, refetch } = useApi(() => analyticsService.getDashboard(period), [period]);

  if (isLoading) return <div className="space-y-6"><PageHeader title="Analisis" description="Pola pengeluaranmu." /><AnalisisSkeleton /></div>;
  if (error) return <div className="space-y-6"><PageHeader title="Analisis" description="Pola pengeluaranmu." /><ErrorState message={error} onRetry={refetch} /></div>;

  const { topCategories, weekdayWeekend, insights, summary } = data!;

  // Build donut chart segments from topCategories
  const circumference = 2 * Math.PI * 15.9;
  const donutSegments = topCategories.map((cat, i) => {
    const dash = (cat.percentage / 100) * circumference;
    const offset = topCategories
      .slice(0, i)
      .reduce((total, item) => total + (item.percentage / 100) * circumference, 0);
    return { ...cat, dash, offset, color: CHART_COLORS[i % CHART_COLORS.length] };
  });

  const totalExpense = summary.totalExpense;
  const maxWeekday = Math.max(weekdayWeekend.weekday, weekdayWeekend.weekend, 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analisis"
        description={`Total pengeluaran: ${formatCurrency(totalExpense, true)}`}
        action={
          <label className="relative block w-full sm:w-44">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as DashboardPeriodOption)}
              className="h-11 w-full appearance-none rounded-2xl border border-[var(--color-border)] bg-white px-4 pr-10 text-sm font-bold text-[var(--color-text-primary)] outline-none focus:border-[var(--color-teal-dark)]"
            >
              <option value="current_month">Bulan Ini</option>
              <option value="last_month">Bulan Lalu</option>
              <option value="3_months">3 Bulan</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
          </label>
        }
      />

      <section className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        {/* Top Categories bar chart */}
        <Card className="min-h-[300px]">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-[var(--color-text-primary)]">Top Kategori</h2>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">Pengeluaran terbesar bulan ini.</p>
            </div>
            <TrendingUp className="h-6 w-6 text-[var(--color-text-secondary)]" />
          </div>
          {topCategories.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">Belum ada data kategori.</p>
          ) : (
            <div className="space-y-5">
              {topCategories.map((cat, i) => (
                <div key={cat.categoryId}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-[var(--color-text-primary)]">{cat.categoryName}</p>
                    <p className="text-sm font-black" style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}>
                      {formatCurrency(cat.total, true)} · {cat.percentage}%
                    </p>
                  </div>
                  <ProgressBar
                    value={cat.percentage}
                    max={100}
                    color={CHART_COLORS[i % CHART_COLORS.length]}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Donut chart */}
        <Card className="h-full">
          <h2 className="text-xl font-black text-[var(--color-text-primary)]">Distribusi</h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Komposisi pengeluaran.</p>

          <div className="my-7 flex justify-center">
            <div className="relative h-40 w-40">
              <svg className="h-40 w-40 -rotate-90" viewBox="0 0 36 36" aria-label="Donut kategori">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F0EDE8" strokeWidth="4" />
                {donutSegments.map((segment) => (
                  <circle
                    key={segment.categoryId}
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke={segment.color}
                    strokeDasharray={`${segment.dash} ${circumference - segment.dash}`}
                    strokeDashoffset={-segment.offset}
                    strokeLinecap="round"
                    strokeWidth="4"
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-semibold text-[var(--color-text-muted)]">Total</span>
                <span className="text-xl font-black text-[var(--color-text-primary)]">
                  {formatCurrency(totalExpense, true)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {topCategories.map((cat, i) => (
              <div key={cat.categoryId} className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                />
                <span className="flex-1 text-sm font-bold text-[var(--color-text-primary)]">{cat.categoryName}</span>
                <span className="text-sm font-black">{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {/* Weekday vs Weekend */}
        <Card className="h-full">
          <div className="mb-6 flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-[var(--color-teal-ink)]" />
            <h2 className="text-xl font-black text-[var(--color-text-primary)]">Hari Kerja vs Akhir Pekan</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Hari Kerja", value: weekdayWeekend.weekday, color: "var(--color-teal-dark)" },
              { label: "Akhir Pekan", value: weekdayWeekend.weekend, color: "var(--color-salmon)" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-[var(--color-soft)] p-4">
                <p className="text-sm font-bold text-[var(--color-text-secondary)]">{item.label}</p>
                <p className="mt-2 text-2xl font-black text-[var(--color-text-primary)]">
                  {formatCurrency(item.value)}
                </p>
                <ProgressBar className="mt-4" value={item.value} max={maxWeekday} color={item.color} />
              </div>
            ))}
          </div>
          {weekdayWeekend.weekend > weekdayWeekend.weekday && (
            <p className="mt-5 text-sm font-bold text-[var(--color-text-secondary)]">
              Akhir pekan lebih besar. Pasang batas jajan kecil dulu.
            </p>
          )}
        </Card>

        {/* Insights from API */}
        <Card className="h-full !border-[var(--color-teal)] !bg-[var(--color-teal-bg)]">
          <h2 className="text-xl font-black text-[var(--color-teal-ink)]">Rekomendasi</h2>
          <div className="mt-5 space-y-3">
            {insights.length === 0 ? (
              <p className="text-sm text-[var(--color-teal-ink)]">Belum ada rekomendasi.</p>
            ) : (
              insights.slice(0, 3).map((insight, i) => (
                <div key={i} className="flex gap-3 rounded-2xl bg-white/80 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-soft)] text-[var(--color-teal-ink)] text-lg">
                    {insight.type === "tip" ? "💡" : insight.type === "alert" ? "⚠️" : "ℹ️"}
                  </span>
                  <div>
                    <p className="font-black text-[var(--color-text-primary)]">
                      {insight.type === "tip" ? "Tips" : insight.type === "alert" ? "Perhatian" : "Info"}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">{insight.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
