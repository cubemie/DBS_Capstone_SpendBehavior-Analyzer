import Badge from "./Badge";
import Button from "./Button";
import Card from "./Card";
import { cn } from "../utils/cn";
import type { Warning } from "../types/models";

interface WarningCardProps {
  warning: Warning;
}

function WarningCard({ warning }: WarningCardProps) {
  const Icon = warning.icon;
  const severityClass = {
    info: "bg-[var(--color-teal-bg)] text-[var(--color-teal-ink)]",
    warning: "bg-[var(--color-salmon-bg)] text-[var(--color-salmon-dark)]",
    danger: "bg-[var(--color-danger-bg)] text-[var(--color-red)]",
    success: "bg-[var(--color-success-bg)] text-[var(--color-green)]",
  }[warning.severity];

  const badgeVariant = warning.severity === "warning" ? "coral" : warning.severity === "success" ? "success" : "neutral";

  return (
    <Card className="flex h-full flex-col gap-5 overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <span className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", severityClass)}>
          <Icon className="h-6 w-6" />
        </span>
        <Badge variant={badgeVariant}>{warning.label}</Badge>
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-black leading-snug text-[var(--color-text-primary)]">
          {warning.title}
        </h3>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
          {warning.description}
        </p>
      </div>
      <Button variant={warning.severity === "warning" ? "primary" : "outline"} fullWidth>
        {warning.actionLabel}
      </Button>
    </Card>
  );
}

export default WarningCard;
