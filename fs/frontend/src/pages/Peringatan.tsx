import { ShieldCheck, TrendingUp, AlertTriangle, ShieldAlert, Info, CalendarClock, Droplets } from "lucide-react";
import quokkaImg from "../assets/quokka-alert.png";
import Card from "../components/Card";
import MoneyLeakCard from "../components/MoneyLeakCard";
import PageHeader from "../components/PageHeader";
import WarningCard from "../components/WarningCard";
import ErrorState from "../components/ErrorState";
import { useApi } from "../hooks/useApi";
import { analyticsService } from "../services/analyticsService";
import { formatCurrency } from "../utils/formatCurrency";
import type { DashboardWarning, MoneyLeak, Warning } from "../types/models";

function toWarning(w: DashboardWarning): Warning {
  // Map both old (low/medium/high) and new (info/warning/danger/success) backend severity values
  const severityNorm = ((): "info" | "warning" | "danger" | "success" => {
    switch (w.severity) {
      case "high":    return "danger";
      case "medium":  return "warning";
      case "low":     return "info";
      case "danger":  return "danger";
      case "warning": return "warning";
      case "success": return "success";
      case "info":    return "info";
      default:        return "info";
    }
  })();
  const iconForSeverity = {
    danger:  ShieldAlert,
    warning: AlertTriangle,
    success: ShieldCheck,
    info:    Info,
  }[severityNorm];
  const labelForSeverity = {
    danger:  "Bahaya",
    warning: "Perhatian",
    success: "Aman",
    info:    "Info",
  }[severityNorm];
  return {
    id: w.id,
    title: w.category ? `Peringatan Kategori ${w.category}` : "Peringatan Finansial",
    description: w.message,
    label: labelForSeverity,
    severity: severityNorm,
    actionLabel: "Lihat Detail",
    icon: iconForSeverity,
  };
}

function toLeakWarning(l: MoneyLeak, index: number): Warning {
  return {
    id: `leak-${index}`,
    title: `Potensi Kebocoran: ${l.categoryName}`,
    description: `Pengeluaran berulang terdeteksi di kategori ${l.categoryName} sebanyak ${l.frequency} kali dengan total ${formatCurrency(l.amount)}.`,
    label: `${l.frequency}x Transaksi`,
    severity: "danger",
    actionLabel: "Cek Detail",
    icon: CalendarClock,
  };
}

function PeringatanSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 rounded-3xl bg-[var(--color-soft)]" />
      <div className="space-y-4">
        <div className="h-6 w-48 rounded bg-[var(--color-soft)]" />
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="h-44 rounded-3xl bg-[var(--color-soft)]" />
          <div className="h-44 rounded-3xl bg-[var(--color-soft)]" />
        </div>
      </div>
    </div>
  );
}

export default function Peringatan() {
  const { data, isLoading, error } = useApi(() => analyticsService.getDashboard());

  if (isLoading) {
    return (
      <div className="space-y-7">
        <PageHeader title="Peringatan" description="Cek sinyal yang butuh perhatian." />
        <PeringatanSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-7">
        <PageHeader title="Peringatan" description="Cek sinyal yang butuh perhatian." />
        <ErrorState message={error} />
      </div>
    );
  }

  const { warnings = [], moneyLeaks = [] } = data || {};

  const mappedWarnings = warnings.map(toWarning);
  const mappedLeaks = moneyLeaks.map(toLeakWarning);

  if (mappedLeaks.length === 0) {
    mappedLeaks.push({
      id: "leak-clear",
      title: "Semua Aman",
      description: "Belum ada kebocoran atau pengeluaran tidak biasa yang terdeteksi.",
      label: "Aman",
      severity: "success",
      actionLabel: "Pantau",
      icon: Droplets,
    });
  }

  return (
    <div className="space-y-7">
      <PageHeader title="Peringatan" description="Cek sinyal yang butuh perhatian." />

      <Card className="!bg-[var(--color-yellow-bg)]">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <img
            src={quokkaImg}
            alt="Mascot BUDU"
            className="h-24 w-24 rounded-full object-cover object-top shadow-[0_16px_40px_rgba(242,140,106,0.18)] ring-4 ring-white"
          />
          <div>
            <h2 className="text-2xl font-black text-[var(--color-brand)]">Tenang, ini cuma sinyal.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              BUDU bantu kamu cek pengeluaran yang mulai naik atau bocor kecil.
            </p>
          </div>
        </div>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-salmon-bg)] text-[var(--color-salmon-dark)]">
            <TrendingUp className="h-5 w-5" />
          </span>
          <h2 className="text-xl font-black text-[var(--color-text-primary)]">Peringatan Pintar</h2>
        </div>
        {mappedWarnings.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)] italic">Tidak ada peringatan pintar saat ini.</p>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {mappedWarnings.map((warning) => (
              <WarningCard key={warning.id} warning={warning} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-teal-bg)] text-[var(--color-teal-ink)]">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <h2 className="text-xl font-black text-[var(--color-text-primary)]">Deteksi Kebocoran</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {mappedLeaks.map((leak) => (
            <MoneyLeakCard key={leak.id} leak={leak} />
          ))}
        </div>
      </section>
    </div>
  );
}

