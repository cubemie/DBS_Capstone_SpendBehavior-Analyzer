import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

/**
 * Format tanggal ke string yang mudah dibaca
 */
export function formatDate(date, pattern = 'dd MMM yyyy') {
  if (!date) return '-'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, pattern, { locale: id })
}

/**
 * Format tanggal relatif (hari ini, kemarin, atau tanggal)
 */
export function formatRelativeDate(date) {
  if (!date) return '-'
  const d = typeof date === 'string' ? parseISO(date) : date
  if (isToday(d)) return 'Hari ini'
  if (isYesterday(d)) return 'Kemarin'
  return format(d, 'dd MMM yyyy', { locale: id })
}

/**
 * Format jarak waktu dari sekarang
 */
export function formatTimeAgo(date) {
  if (!date) return '-'
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: id })
}

/**
 * Format bulan dan tahun
 */
export function formatMonthYear(month, year) {
  const d = new Date(year, month - 1, 1)
  return format(d, 'MMMM yyyy', { locale: id })
}

/**
 * Ambil bulan dan tahun saat ini
 */
export function getCurrentMonthYear() {
  const now = new Date()
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  }
}
