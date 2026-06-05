import type { DashboardPeriod } from "../types/models";

function toDateInputValue(date: string): string {
  return date.slice(0, 10);
}

export function buildExpenseFilterSearch(
  period: DashboardPeriod,
  categoryId?: string,
): string {
  const params = new URLSearchParams({
    type: "expense",
    startDate: toDateInputValue(period.from),
    endDate: toDateInputValue(period.to),
    sort: "date_desc",
  });

  if (categoryId) {
    params.set("categoryId", categoryId);
  }

  return params.toString();
}
