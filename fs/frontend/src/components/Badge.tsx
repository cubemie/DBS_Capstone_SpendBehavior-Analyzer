import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "teal" | "coral" | "yellow" | "neutral" | "success" | "danger";
  icon?: ReactNode;
}

function Badge({
  className,
  variant = "neutral",
  icon,
  children,
  ...props
}: BadgeProps) {
  const variantClass = {
    teal: "bg-[var(--color-teal-bg)] text-[var(--color-teal-ink)] border-[var(--color-teal)]",
    coral: "bg-[var(--color-salmon-bg)] text-[var(--color-salmon-dark)] border-[var(--color-salmon-light)]",
    yellow: "bg-[var(--color-yellow-bg)] text-[var(--color-yellow-ink)] border-[var(--color-yellow)]",
    neutral: "bg-[var(--color-soft)] text-[var(--color-text-secondary)] border-[var(--color-border)]",
    success: "bg-[var(--color-success-bg)] text-[var(--color-green)] border-[var(--color-success-border)]",
    danger: "bg-[var(--color-danger-bg)] text-[var(--color-red)] border-[var(--color-danger-border)]",
  }[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold",
        variantClass,
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}

export default Badge;
