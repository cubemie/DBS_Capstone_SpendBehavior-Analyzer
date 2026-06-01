export function formatCurrency(amount: number, compact = false): string {
  const absoluteAmount = Math.abs(amount);

  if (compact && absoluteAmount >= 1_000_000) {
    const value = absoluteAmount / 1_000_000;
    const formatted = Number.isInteger(value) ? value.toString() : value.toFixed(1);
    return `Rp ${formatted}Jt`;
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absoluteAmount);
}
