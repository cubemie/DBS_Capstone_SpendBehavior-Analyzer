import { cn } from '@/utils/classNames'
import { formatCurrency } from '@/utils/formatCurrency'

/**
 * CurrencyDisplay
 * @param {number} amount
 * @param {string} type - income | expense | neutral
 * @param {boolean} compact
 * @param {string} size - sm | md | lg | xl
 */
const sizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg font-semibold',
  xl: 'text-2xl font-bold',
}

const typeColors = {
  income: 'text-income',
  expense: 'text-expense',
  neutral: 'text-gray-900 dark:text-white',
}

export default function CurrencyDisplay({ amount, type = 'neutral', compact = false, size = 'md', className }) {
  const formatted = formatCurrency(amount, { compact })
  const prefix = type === 'income' ? '+' : type === 'expense' ? '-' : ''

  return (
    <span className={cn('font-mono', sizes[size], typeColors[type], className)}>
      {prefix}{formatted}
    </span>
  )
}
