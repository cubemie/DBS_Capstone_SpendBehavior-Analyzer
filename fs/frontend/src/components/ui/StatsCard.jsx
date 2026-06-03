import { cn } from '@/utils/classNames'
import { TrendingUp, TrendingDown } from 'lucide-react'

/**
 * StatsCard - shows a key metric with optional trend
 * @param {string} title
 * @param {string|number} value - formatted value to display
 * @param {number} change - percentage change (positive = up, negative = down)
 * @param {ReactNode} icon
 * @param {string} color - primary | green | red | blue | amber
 * @param {boolean} loading
 */
const colorMap = {
  primary: 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400',
  green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
}

export default function StatsCard({ title, value, change, icon: Icon, color = 'primary', loading, className }) {
  if (loading) {
    return (
      <div className={cn('card p-5', className)}>
        <div className="skeleton h-4 w-24 mb-3" />
        <div className="skeleton h-8 w-32 mb-2" />
        <div className="skeleton h-3 w-16" />
      </div>
    )
  }

  const isPositive = change >= 0
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

  return (
    <div className={cn('card p-5', className)}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        {Icon && (
          <div className={cn('p-2 rounded-xl', colorMap[color])}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white font-display mb-1">{value}</p>
      {change !== undefined && (
        <div className={cn('flex items-center gap-1 text-xs font-medium', isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
          <TrendIcon className="w-3 h-3" />
          <span>{isPositive ? '+' : ''}{change?.toFixed(1)}% vs bulan lalu</span>
        </div>
      )}
    </div>
  )
}
