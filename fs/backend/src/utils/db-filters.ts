import { gte, lte, type SQL } from 'drizzle-orm'

type ComparableColumn = Parameters<typeof gte>[0]

export function addTimestampRangeFilters(
  filters: SQL[],
  column: ComparableColumn,
  from?: string,
  to?: string,
): void {
  if (from) {
    filters.push(gte(column, new Date(from)))
  }

  if (to) {
    filters.push(lte(column, new Date(to)))
  }
}
