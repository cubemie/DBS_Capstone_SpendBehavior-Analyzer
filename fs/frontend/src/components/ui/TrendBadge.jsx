import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/utils/classNames'

/**
 * TrendBadge
 * @param {number} change - percentage
 * @param {string} type - income | expense — affects color semantics
 */
export default function TrendBadge({ change, type = 'neutral', className }) {
  if (change === undefined || change === null) return null

  const abs = Math.abs(change).toFixed(1)
  const isZero = change === 0

  // For expense, up is bad (red); for income, up is good (green)
  const isGood = isZero ? null : type === 'expense' ? change < 0 : change > 0

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full',
        isZero
          ? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
          : isGood
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        className
      )}
    >
      {isZero ? (
        <Minus className="w-3 h-3" />
      ) : change > 0 ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {isZero ? '0%' : `${change > 0 ? '+' : '-'}${abs}%`}
    </span>
  )
}
