import type { ReactNode } from "react";
import Button from "./Button";

interface SettingsRowProps {
  icon: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  trailing?: ReactNode;
}

function SettingsRow({ icon, title, description, actionLabel = "Kelola", trailing }: SettingsRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-soft)] text-[var(--color-teal-ink)]">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="font-black text-[var(--color-text-primary)]">{title}</p>
          {description ? (
            <p className="mt-0.5 truncate text-sm text-[var(--color-text-muted)]">{description}</p>
          ) : null}
        </div>
      </div>
      {trailing ?? (
        <Button variant="outline" buttonSize="sm" className="shrink-0">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default SettingsRow;
