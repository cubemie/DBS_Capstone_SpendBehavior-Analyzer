import Badge from "./Badge";
import { cn } from "../utils/cn";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate, formatTime } from "../utils/formatDate";
import type { Transaction } from "../types/models";

interface TransactionItemProps {
  transaction: Transaction;
  compact?: boolean;
}

function TransactionItem({ transaction, compact = false }: TransactionItemProps) {
  const Icon = transaction.icon;
  const amountPrefix = transaction.type === "income" ? "+" : "-";
  const amountClass =
    transaction.type === "income" ? "text-[var(--color-green)]" : "text-[var(--color-red)]";
  const accentClass = {
    teal: "bg-[var(--color-teal-bg)] text-[var(--color-teal-ink)]",
    coral: "bg-[var(--color-salmon-bg)] text-[var(--color-salmon-dark)]",
    yellow: "bg-[var(--color-yellow-bg)] text-[var(--color-yellow-ink)]",
    neutral: "bg-[var(--color-soft)] text-[var(--color-text-secondary)]",
  }[transaction.accent];

  return (
    <article
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white p-3",
        compact && "border-0 p-0",
      )}
    >
      <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", accentClass)}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-[var(--color-text-primary)]">
              {transaction.title}
            </h3>
            <p className="mt-0.5 truncate text-xs text-[var(--color-text-muted)]">
              {transaction.method} - {formatDate(transaction.date)} {formatTime(transaction.date)}
            </p>
          </div>
          <p className={cn("shrink-0 text-sm font-black", amountClass)}>
            {amountPrefix}
            {formatCurrency(transaction.amount)}
          </p>
        </div>
        {!compact ? (
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-xs text-[var(--color-text-muted)]">{transaction.merchant}</span>
            <Badge variant={transaction.type === "income" ? "teal" : "neutral"}>
              {transaction.category}
            </Badge>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default TransactionItem;

