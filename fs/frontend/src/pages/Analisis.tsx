import { BarChart3, ChevronDown, TrendingUp } from "lucide-react";
import Card from "../components/Card";
import InsightCard from "../components/InsightCard";
import ProgressBar from "../components/ProgressBar";
import SectionHeader from "../components/SectionHeader";
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
      <SectionHeader
        eyebrow="Insight pengeluaran"
        title="Analisis Pengeluaran"
        description={`Bulan ini, Anda lebih hemat ${monthlySummary.savingRate}% dari rata-rata. Fokus berikutnya: jaga akhir pekan tetap terkendali.`}
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
        <Card className="min-h-[380px]">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-[var(--color-text-primary)]">Tren Pengeluaran</h2>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">Pergerakan total pengeluaran per minggu.</p>
            </div>
            <TrendingUp className="h-6 w-6 text-[var(--color-text-secondary)]" />
          </div>

          <div className="relative h-72">
            <div className="absolute inset-y-2 left-0 flex flex-col justify-between text-xs font-semibold text-[var(--color-text-muted)]">
              <span>10Jt</span>
              <span>5Jt</span>
              <span>0</span>
            </div>
            <svg
              className="ml-10 h-64 w-[calc(100%-2.5rem)] overflow-visible"
              viewBox="0 0 600 240"
              preserveAspectRatio="none"
              aria-label="Grafik tren pengeluaran"
            >
              <defs>
                <linearGradient id="analysisArea" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#F28C6A" stopOpacity="0.28" />
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
              <foreignObject x="355" y="42" width="150" height="70">
                <div className="rounded-2xl border border-[var(--color-yellow)] bg-white px-4 py-3 text-sm shadow-[0_10px_24px_rgba(77,62,38,0.12)]">
                  <p className="font-semibold text-[var(--color-text-secondary)]">Minggu ke-3</p>
                  <p className="font-black text-[var(--color-salmon-dark)]">Rp 3.500.000</p>
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
          <h2 className="text-2xl font-black text-[var(--color-text-primary)]">Top Kategori</h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Kontributor terbesar bulan ini.</p>

          <div className="my-8 flex justify-center">
            <div className="relative h-44 w-44">
              <svg className="h-44 w-44 -rotate-90" viewBox="0 0 36 36" aria-label="Donut kategori">
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
          <div className="mb-7 flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-[var(--color-teal-ink)]" />
            <div>
              <h2 className="text-2xl font-black text-[var(--color-text-primary)]">Hari Kerja vs Akhir Pekan</h2>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">Akhir pekan masih jadi titik rawan impulsif.</p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {[
              { label: "Hari Kerja", value: 210000, color: "var(--color-teal-dark)" },
              { label: "Akhir Pekan", value: 420000, color: "var(--color-salmon)" },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl bg-[var(--color-soft)] p-5">
                <p className="text-sm font-bold text-[var(--color-text-secondary)]">{item.label}</p>
                <p className="mt-2 text-2xl font-black text-[var(--color-text-primary)]">
                  {formatCurrency(item.value)}
                </p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">rata-rata per hari</p>
                <ProgressBar className="mt-4" value={item.value} max={420000} color={item.color} />
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-base leading-7 text-[var(--color-text-secondary)]">
            Pengeluaran akhir pekan <strong className="text-[var(--color-salmon-dark)]">2x lebih besar</strong>. Jadikan Sabtu-Minggu tetap menyenangkan dengan batas jajan yang jelas.
          </p>
        </Card>

        <Card className="!border-[var(--color-teal)] !bg-[var(--color-teal-bg)]">
          <p className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-black text-[var(--color-teal-ink)]">
            psychology
          </p>
          <h2 className="mt-4 text-3xl font-black leading-tight text-[var(--color-teal-ink)]">
            Rekomendasi Cerdas
          </h2>
          <div className="mt-5 space-y-3">
            {insights.slice(0, 2).map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
