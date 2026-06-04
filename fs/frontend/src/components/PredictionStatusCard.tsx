import { AlertTriangle, BarChart3, CheckCircle2, Plus } from "lucide-react";
import Button from "./Button";
import Card from "./Card";
import Badge from "./Badge";
import type { DashboardPersona, DashboardPredictionStatus } from "../types/models";

interface PredictionStatusCardProps {
  status: DashboardPredictionStatus;
  persona: DashboardPersona | null;
  onRefresh: () => void;
  onAddTransaction: () => void;
  isRefreshing: boolean;
  error?: string;
}

function getStatusCopy(status: DashboardPredictionStatus) {
  if (status.state === "empty") {
    return {
      title: "Belum Ada Data Analisis",
      description: "Tambahkan transaksi pengeluaran periode ini agar BUDU bisa membaca pola belanjamu.",
      label: "Kosong",
      buttonLabel: "Tambah Transaksi",
      icon: Plus,
      action: "add" as const,
    };
  }

  if (status.state === "missing") {
    return {
      title: "Analisis Periode Ini Belum Dibuat",
      description: "Jalankan analisis untuk membuat persona dan peringatan pintar dari transaksi periode ini.",
      label: "Perlu Analisis",
      buttonLabel: "Analisis Sekarang",
      icon: BarChart3,
      action: "refresh" as const,
    };
  }

  if (status.state === "stale") {
    return {
      title: "Analisis Perlu Diperbarui",
      description: "Transaksi periode ini berubah sejak analisis terakhir. Perbarui agar persona dan peringatan akurat.",
      label: "Tidak Terbaru",
      buttonLabel: "Perbarui Analisis",
      icon: AlertTriangle,
      action: "refresh" as const,
    };
  }

  return {
    title: "Analisis Periode Ini Terbaru",
    description: "Persona dan peringatan pintar sudah sesuai dengan transaksi periode ini.",
    label: "Terbaru",
    buttonLabel: "Perbarui Lagi",
    icon: CheckCircle2,
    action: "refresh" as const,
  };
}

export default function PredictionStatusCard({
  status,
  persona,
  onRefresh,
  onAddTransaction,
  isRefreshing,
  error,
}: PredictionStatusCardProps) {
  const copy = getStatusCopy(status);
  const Icon = copy.icon;
  const isEmpty = status.state === "empty";
  const isFresh = status.state === "fresh";

  return (
    <Card className={isFresh ? "!border-[var(--color-teal)] !bg-[var(--color-teal-bg)]" : undefined}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--color-teal-ink)]">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-black leading-tight text-[var(--color-text-primary)]">
              {copy.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              {copy.description}
            </p>
          </div>
        </div>
        <Badge variant={isFresh ? "success" : isEmpty ? "neutral" : "coral"}>
          {copy.label}
        </Badge>
      </div>

      {persona && (
        <p className="mt-4 rounded-2xl bg-white/80 px-4 py-3 text-sm font-bold text-[var(--color-text-primary)]">
          Persona saat ini: {persona.persona}
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-xl bg-[var(--color-salmon-bg)] px-4 py-3 text-sm font-semibold text-[var(--color-salmon-dark)]">
          {error}
        </p>
      )}

      <Button
        type="button"
        fullWidth
        className="mt-5"
        variant={isEmpty ? "outline" : "primary"}
        isLoading={isRefreshing}
        onClick={copy.action === "add" ? onAddTransaction : onRefresh}
      >
        {copy.buttonLabel}
      </Button>
    </Card>
  );
}
