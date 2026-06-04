import { useState } from "react";
import { ShieldCheck, TrendingUp, AlertTriangle, ShieldAlert, Info, CalendarClock, Droplets, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import quokkaImg from "../assets/budu-logo.png";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Card from "../components/Card";
import MoneyLeakCard from "../components/MoneyLeakCard";
import PageHeader from "../components/PageHeader";
import PredictionStatusCard from "../components/PredictionStatusCard";
import WarningCard from "../components/WarningCard";
import ErrorState from "../components/ErrorState";
import { useApi } from "../hooks/useApi";
import { usePredictionRefresh } from "../hooks/usePredictionRefresh";
import { analyticsService } from "../services/analyticsService";
import { formatDate } from "../utils/formatDate";
import type { DashboardWarning, MoneyLeak, Warning } from "../types/models";

type SelectedWarning = {
  warning: DashboardWarning;
  viewModel: Warning;
};

function toWarning(w: DashboardWarning): Warning {
  const iconForSeverity = {
    danger:  ShieldAlert,
    warning: AlertTriangle,
    success: ShieldCheck,
    info:    Info,
  }[w.severity] || Info;

  return {
    id: w.id,
    title: w.title,
    description: w.description,
    label: w.label,
    severity: w.severity,
    actionLabel: "Lihat Detail",
    icon: iconForSeverity,
  };
}

function toLeakWarning(l: MoneyLeak): Warning {
  return {
    id: l.id,
    title: l.title,
    description: l.description,
    label: l.label,
    severity: l.severity,
    actionLabel: "Cek Detail",
    icon: CalendarClock,
  };
}

function toDateInputValue(date: string): string {
  return date.slice(0, 10);
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
  const navigate = useNavigate();
  const [selectedWarning, setSelectedWarning] = useState<SelectedWarning | null>(null);
  const { data, isLoading, error, refetch } = useApi(() => analyticsService.getDashboard());
  const {
    refreshAnalysis,
    goToAddTransaction,
    isRefreshing,
    refreshError,
  } = usePredictionRefresh(refetch);

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

  const warnings = data?.warnings ?? [];
  const moneyLeaks = data?.moneyLeaks ?? [];
  const persona = data?.persona ?? null;
  const predictionStatus = data?.predictionStatus;

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

  const goToPeriodExpenses = () => {
    if (!data) return;

    const params = new URLSearchParams({
      type: "expense",
      startDate: toDateInputValue(data.period.from),
      endDate: toDateInputValue(data.period.to),
      sort: "date_desc",
    });

    navigate(`/riwayat?${params.toString()}`);
  };

  const goToLeakTransactions = (leak: MoneyLeak) => {
    if (!data) return;

    const params = new URLSearchParams({
      type: "expense",
      categoryId: leak.categoryId,
      startDate: toDateInputValue(data.period.from),
      endDate: toDateInputValue(data.period.to),
      sort: "date_desc",
    });

    navigate(`/riwayat?${params.toString()}`);
  };

  return (
    <div className="space-y-7">
      {selectedWarning && data ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <Card className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-salmon-bg)] text-[var(--color-salmon-dark)]">
                  <selectedWarning.viewModel.icon className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <Badge variant={selectedWarning.viewModel.severity === "warning" ? "coral" : "neutral"}>
                    {selectedWarning.warning.label}
                  </Badge>
                  <h2 className="mt-3 text-xl font-black leading-tight text-[var(--color-text-primary)]">
                    {selectedWarning.warning.title}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedWarning(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-[var(--color-text-muted)] hover:bg-[var(--color-soft)] hover:text-[var(--color-text-primary)]"
                aria-label="Tutup detail peringatan"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-5 text-sm leading-6 text-[var(--color-text-secondary)]">
              {selectedWarning.warning.description}
            </p>

            <div className="mt-5 grid gap-3 rounded-2xl bg-[var(--color-soft)] p-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="font-semibold text-[var(--color-text-muted)]">Sumber</span>
                <span className="text-right font-bold text-[var(--color-text-primary)]">Prediksi persona</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-semibold text-[var(--color-text-muted)]">Periode</span>
                <span className="text-right font-bold text-[var(--color-text-primary)]">
                  {formatDate(data.period.from)} - {formatDate(data.period.to)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-semibold text-[var(--color-text-muted)]">Transaksi dianalisis</span>
                <span className="text-right font-bold text-[var(--color-text-primary)]">
                  {data.predictionStatus.transactionCount}
                </span>
              </div>
              {data.predictionStatus.lastPredictedAt ? (
                <div className="flex justify-between gap-4">
                  <span className="font-semibold text-[var(--color-text-muted)]">Terakhir dianalisis</span>
                  <span className="text-right font-bold text-[var(--color-text-primary)]">
                    {formatDate(data.predictionStatus.lastPredictedAt)}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" fullWidth onClick={() => setSelectedWarning(null)}>
                Tutup
              </Button>
              <Button fullWidth onClick={goToPeriodExpenses}>
                Lihat Transaksi
              </Button>
            </div>
          </Card>
        </div>
      ) : null}

      <PageHeader title="Peringatan" description="Cek sinyal yang butuh perhatian." />

      <Card className="!bg-[var(--color-yellow-bg)]">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <img
            src={quokkaImg}
            alt="Mascot BUDU"
            className="h-24 w-24 rounded-full object-cover object-center shadow-[0_16px_40px_rgba(242,140,106,0.18)] ring-4 ring-white"
          />
          <div>
            <h2 className="text-2xl font-black text-[var(--color-brand)]">Tenang, ini cuma sinyal.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              BUDU bantu kamu cek pengeluaran yang mulai naik atau bocor kecil.
            </p>
          </div>
        </div>
      </Card>

      {predictionStatus && (
        <PredictionStatusCard
          status={predictionStatus}
          persona={persona}
          onRefresh={refreshAnalysis}
          onAddTransaction={goToAddTransaction}
          isRefreshing={isRefreshing}
          error={refreshError}
        />
      )}

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
            {mappedWarnings.map((warning, index) => (
              <WarningCard
                key={warning.id}
                warning={warning}
                onAction={() => setSelectedWarning({ warning: warnings[index]!, viewModel: warning })}
              />
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
          {mappedLeaks.map((leak, index) => (
            <MoneyLeakCard
              key={leak.id}
              leak={leak}
              onAction={moneyLeaks[index] ? () => goToLeakTransactions(moneyLeaks[index]!) : undefined}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
