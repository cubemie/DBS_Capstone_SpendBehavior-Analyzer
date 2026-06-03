import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  buttonSize?: "sm" | "md" | "lg" | "icon";
  fullWidth?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  isLoading?: boolean;
}

function Button({
  className,
  variant = "primary",
  buttonSize = "md",
  fullWidth = false,
  iconLeft,
  iconRight,
  isLoading = false,
  children,
  type = "button",
  disabled,
  ...props
}: ButtonProps) {
  const variantClass = {
    primary: "bg-[var(--color-salmon)] text-white shadow-[0_10px_24px_rgba(242,140,106,0.22)] hover:bg-[var(--color-salmon-dark)]",
    secondary: "bg-[var(--color-teal)] text-[var(--color-teal-ink)] hover:bg-[var(--color-teal-dark)] hover:text-white",
    outline: "border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] hover:border-[var(--color-teal-dark)] hover:bg-[var(--color-teal-bg)]",
    ghost: "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-soft)]",
    danger: "border border-[var(--color-salmon-light)] bg-[var(--color-salmon-bg)] text-[var(--color-red)] hover:bg-[var(--color-salmon-light)]",
  }[variant];

  const sizeClass = {
    sm: "min-h-9 px-3 text-sm",
    md: "min-h-11 px-4 text-sm",
    lg: "min-h-12 px-5 text-base",
    icon: "h-10 w-10 p-0",
  }[buttonSize];

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-teal-dark)] disabled:pointer-events-none disabled:opacity-60",
        sizeClass,
        variantClass,
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Proses...
        </span>
      ) : (
        <>
          {iconLeft}
          {children}
          {iconRight}
        </>
      )}
    </button>
  );
}

export default Button;
