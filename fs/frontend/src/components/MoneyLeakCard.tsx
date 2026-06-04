import Badge from "./Badge";
import Button from "./Button";
import Card from "./Card";
import { cn } from "../utils/cn";
import type { Warning } from "../types/models";

interface MoneyLeakCardProps {
  leak: Warning;
  onAction?: () => void;
}

function MoneyLeakCard({ leak, onAction }: MoneyLeakCardProps) {
  const Icon = leak.icon;
  const isClear = leak.severity === "success";
  const toneClass = {
    info: "bg-[var(--color-teal-bg)] text-[var(--color-teal-ink)]",
    warning: "bg-[var(--color-yellow-bg)] text-[var(--color-yellow-ink)]",
    danger: "bg-[var(--color-danger-bg)] text-[var(--color-red)]",
    success: "bg-[var(--color-success-bg)] text-[var(--color-green)]",
  }[leak.severity];

  return (
    <Card
      className={cn(
        "flex min-h-[270px] flex-col justify-between",
        isClear && "border-dashed border-[var(--color-teal)] text-center",
      )}
    >
      <div>
        <div className={cn("mb-5 flex items-center gap-3", isClear && "justify-center")}>
          <span className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", toneClass)}>
            <Icon className="h-6 w-6" />
          </span>
          {!isClear ? <Badge variant="neutral">{leak.label}</Badge> : null}
        </div>
        <h3 className="text-lg font-black text-[var(--color-text-primary)]">{leak.title}</h3>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">{leak.description}</p>
      </div>
      {leak.actionLabel && onAction ? (
        <Button
          variant={isClear ? "outline" : leak.severity === "danger" ? "danger" : "primary"}
          fullWidth
          className="mt-6"
          onClick={onAction}
        >
          {leak.actionLabel}
        </Button>
      ) : null}
    </Card>
  );
}

export default MoneyLeakCard;
