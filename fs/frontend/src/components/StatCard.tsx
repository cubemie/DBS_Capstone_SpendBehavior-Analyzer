import type { ReactNode } from "react";
import Card from "./Card";
import { cn } from "../utils/cn";

interface StatCardProps {
  label: string;
  value: string;
  helper?: string;
  icon: ReactNode;
  tone?: "teal" | "coral" | "yellow" | "neutral";
}

function StatCard({
  label,
  value,
  helper,
  icon,
  tone = "neutral",
}: StatCardProps) {
  const toneClass = {
    teal: "bg-[var(--color-teal-bg)] text-[var(--color-teal-ink)]",
    coral: "bg-[var(--color-salmon-bg)] text-[var(--color-salmon-dark)]",
    yellow: "bg-[var(--color-yellow-bg)] text-[var(--color-yellow-ink)]",
    neutral: "bg-[var(--color-soft)] text-[var(--color-text-secondary)]",
  }[tone];

  return (
    <Card className="min-h-[132px] overflow-hidden">
      <div className="flex h-full flex-col justify-between gap-5">
        <div className="flex items-start justify-between gap-3">
          <span className={cn("flex h-10 w-10 items-center justify-center rounded-2xl", toneClass)}>
            {icon}
          </span>
          {helper ? (
            <span className="rounded-full bg-[var(--color-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
              {helper}
            </span>
          ) : null}
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">{label}</p>
          <p className="mt-1 text-2xl font-black tracking-tight text-[var(--color-text-primary)]">
            {value}
          </p>
        </div>
      </div>
    </Card>
  );
}

export default StatCard;
