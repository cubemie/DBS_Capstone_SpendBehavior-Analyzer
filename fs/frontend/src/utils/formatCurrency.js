/**
 * Format angka ke format mata uang Rupiah
 * @param {number} amount
 * @param {object} options
 * @returns {string}
 */
export function formatCurrency(amount, options = {}) {
  const { showSymbol = true, compact = false } = options

  if (amount === null || amount === undefined || isNaN(amount)) return 'Rp 0'

  const num = Number(amount)

  if (compact && Math.abs(num) >= 1_000_000) {
    const millions = num / 1_000_000
    return `${showSymbol ? 'Rp ' : ''}${millions.toFixed(1)}jt`
  }

  if (compact && Math.abs(num) >= 1_000) {
    const thousands = num / 1_000
    return `${showSymbol ? 'Rp ' : ''}${thousands.toFixed(0)}rb`
  }

  return new Intl.NumberFormat('id-ID', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

/**
 * Parse string mata uang ke number
 */
export function parseCurrency(value) {
  if (!value) return 0
  return Number(String(value).replace(/[^0-9,-]/g, '').replace(',', '.'))
}
