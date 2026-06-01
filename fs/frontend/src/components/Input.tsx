import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  iconLeft?: ReactNode;
}

function Input({
  className,
  label,
  helperText,
  iconLeft,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="block">
      {label ? (
        <span className="mb-2 block text-sm font-semibold text-[var(--color-text-primary)]">
          {label}
        </span>
      ) : null}
      <span className="relative block">
        {iconLeft ? (
          <span className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 text-[var(--color-text-muted)]">
            {iconLeft}
          </span>
        ) : null}
        <input
          id={inputId}
          className={cn(
            "h-12 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-soft)] px-4 text-sm font-medium text-[var(--color-text-primary)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-teal-dark)] focus:bg-white focus:ring-4 focus:ring-[var(--color-teal-bg)]",
            iconLeft ? "pl-11" : undefined,
            className,
          )}
          {...props}
        />
      </span>
      {helperText ? (
        <span className="mt-1.5 block text-xs text-[var(--color-text-muted)]">{helperText}</span>
      ) : null}
    </label>
  );
}

export default Input;
