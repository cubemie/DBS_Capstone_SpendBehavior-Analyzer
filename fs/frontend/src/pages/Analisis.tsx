import { BarChart3, ChevronDown, TrendingUp } from "lucide-react";
import Card from "../components/Card";
import PageHeader from "../components/PageHeader";
import ProgressBar from "../components/ProgressBar";
import { insights, monthlySummary, spendingCategories, weeklyTrend } from "../services/mockData";
import { formatCurrency } from "../utils/formatCurrency";

export default function Analisis() {
  const circumference = 2 * Math.PI * 15.9;
  const donutSegments = spendingCategories.map((category, index) => {
    const dash = (category.percentage / 100) * circumference;
    const offset = spendingCategories
      .slice(0, index)
      .reduce((total, item) => total + (item.percentage / 100) * circumference, 0);

    return { ...category, dash, offset };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analisis"
        description={`Bulan ini kamu lebih hemat ${monthlySummary.savingRate}%.`}
        action={
          <label className="relative block w-full sm:w-44">
            <select className="h-11 w-full appearance-none rounded-2xl border border-[var(--color-border)] bg-white px-4 pr-10 text-sm font-bold text-[var(--color-text-primary)] outline-none focus:border-[var(--color-teal-dark)]">
              <option>Bulan Ini</option>
              <option>Bulan Lalu</option>
              <option>3 Bulan</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
          </label>
        }
      />

      <section className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <Card className="min-h-[340px]">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-[var(--color-text-primary)]">Tren Pengeluaran</h2>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">Per minggu.</p>
            </div>
            <TrendingUp className="h-6 w-6 text-[var(--color-text-secondary)]" />
          </div>

          <div className="relative h-64 sm:h-72">
            <div className="absolute inset-y-2 left-0 flex flex-col justify-between text-xs font-semibold text-[var(--color-text-muted)]">
              <span>10Jt</span>
              <span>5Jt</span>
              <span>0</span>
            </div>
            <svg
              className="ml-10 h-56 w-[calc(100%-2.5rem)] overflow-visible sm:h-64"
              viewBox="0 0 600 240"
              preserveAspectRatio="none"
              aria-label="Grafik tren pengeluaran"
            >
              <defs>
                <linearGradient id="analysisArea" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#F28C6A" stopOpacity="0.24" />
                  <stop offset="100%" stopColor="#F28C6A" stopOpacity="0.04" />
                </linearGradient>
              </defs>
              {[50, 120, 190].map((y) => (
                <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="#EDE9E0" strokeWidth="1" />
              ))}
              <path
                d="M0 190 C80 120 120 150 170 145 C245 135 250 40 330 72 C410 106 350 190 440 155 C510 125 500 15 600 30 L600 240 L0 240 Z"
                fill="url(#analysisArea)"
              />
              <path
                d="M0 190 C80 120 120 150 170 145 C245 135 250 40 330 72 C410 106 350 190 440 155 C510 125 500 15 600 30"
                fill="none"
                stroke="#F28C6A"
                strokeLinecap="round"
                strokeWidth="8"
              />
              <circle cx="330" cy="72" r="10" fill="#F28C6A" />
              <foreignObject x="350" y="42" width="150" height="64">
                <div className="rounded-2xl border border-[var(--color-yellow)] bg-white px-4 py-3 text-sm shadow-[0_10px_24px_rgba(77,62,38,0.12)]">
                  <p className="font-semibold text-[var(--color-text-secondary)]">Minggu 3</p>
                  <p className="font-black text-[var(--color-salmon-dark)]">Rp 3.5Jt</p>
                </div>
              </foreignObject>
            </svg>
            <div className="ml-10 grid grid-cols-4 text-center text-xs font-bold text-[var(--color-text-muted)]">
              {weeklyTrend.map((item) => (
                <span key={item.label}>{item.label}</span>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-black text-[var(--color-text-primary)]">Top Kategori</h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Paling sering keluar.</p>

          <div className="my-7 flex justify-center">
            <div className="relative h-40 w-40">
              <svg className="h-40 w-40 -rotate-90" viewBox="0 0 36 36" aria-label="Donut kategori">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F0EDE8" strokeWidth="4" />
                {donutSegments.map((segment) => (
                  <circle
                    key={segment.id}
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
                <span className="text-xl font-black text-[var(--color-text-primary)]">Rp 8.2Jt</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {spendingCategories.map((category) => (
              <div key={category.id} className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                <span className="flex-1 text-sm font-bold text-[var(--color-text-primary)]">{category.name}</span>
                <span className="text-sm font-black">{category.percentage}%</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card>
          <div className="mb-6 flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-[var(--color-teal-ink)]" />
            <h2 className="text-xl font-black text-[var(--color-text-primary)]">Hari Kerja vs Akhir Pekan</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Hari Kerja", value: 210000, color: "var(--color-teal-dark)" },
              { label: "Akhir Pekan", value: 420000, color: "var(--color-salmon)" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-[var(--color-soft)] p-4">
                <p className="text-sm font-bold text-[var(--color-text-secondary)]">{item.label}</p>
                <p className="mt-2 text-2xl font-black text-[var(--color-text-primary)]">
                  {formatCurrency(item.value)}
                </p>
                <ProgressBar className="mt-4" value={item.value} max={420000} color={item.color} />
              </div>
            ))}
          </div>

          <p className="mt-5 text-sm font-bold text-[var(--color-text-secondary)]">
            Akhir pekan 2x lebih besar. Pasang batas jajan kecil dulu.
          </p>
        </Card>

        <Card className="!border-[var(--color-teal)] !bg-[var(--color-teal-bg)]">
          <h2 className="text-xl font-black text-[var(--color-teal-ink)]">Rekomendasi</h2>
          <div className="mt-5 space-y-3">
            {insights.slice(0, 2).map((insight) => {
              const Icon = insight.icon;
              return (
                <div key={insight.id} className="flex gap-3 rounded-2xl bg-white/80 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-soft)] text-[var(--color-teal-ink)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-black text-[var(--color-text-primary)]">{insight.title}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">{insight.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>
    </div>
  );
}
