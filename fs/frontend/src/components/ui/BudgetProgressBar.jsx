import { cn } from '@/utils/classNames'
import { formatCurrency } from '@/utils/formatCurrency'

/**
 * BudgetProgressBar
 * @param {number} spent
 * @param {number} budget
 * @param {string} label
 * @param {string} color - hex color for category dot
 */
export default function BudgetProgressBar({ spent, budget, label, color, className }) {
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
  const isOver = spent > budget
  const isWarning = pct >= 80

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {color && (
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
          )}
          <span className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-[120px]">{label}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <span className={cn(isOver ? 'text-red-500 font-semibold' : '')}>
            {formatCurrency(spent, { compact: true })}
          </span>
          <span>/</span>
          <span>{formatCurrency(budget, { compact: true })}</span>
        </div>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            isOver ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-primary-500'
          )}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 dark:text-gray-600">
        <span>{pct.toFixed(0)}% terpakai</span>
        {isOver ? (
          <span className="text-red-500 font-medium">Melebihi budget!</span>
        ) : (
          <span>Sisa {formatCurrency(budget - spent, { compact: true })}</span>
        )}
      </div>
    </div>
  )
}
