export function formatRupiah(amount: number): string {
  if (amount >= 1_000_000) {
    const val = amount / 1_000_000;
    return `Rp ${val % 1 === 0 ? val : val.toFixed(1)}Jt`;
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
