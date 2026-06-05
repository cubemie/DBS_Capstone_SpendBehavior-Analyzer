export function isWeekendInTimezone(date: Date, timezone: string): boolean {
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
  }).format(date)

  return weekday === 'Sat' || weekday === 'Sun'
}
