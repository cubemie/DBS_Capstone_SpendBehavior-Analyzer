import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { cn } from '@/utils/classNames'

export default function TransactionTypeBadge({ type, showIcon = true, className }) {
  const isIncome = type === 'income'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
        isIncome
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        className
      )}
    >
      {showIcon && (isIncome ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />)}
      {isIncome ? 'Pemasukan' : 'Pengeluaran'}
    </span>
  )
}
