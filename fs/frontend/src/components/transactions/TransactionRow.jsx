import { formatRelativeDate } from '@/utils/formatDate'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/classNames'

export default function TransactionRow({ transaction, onClick, selected }) {
  const isIncome = transaction.type === 'income'

  return (
    <div
      onClick={() => onClick?.(transaction)}
      className={cn(
        'flex items-center gap-4 px-3 py-3 rounded-xl transition-colors cursor-pointer',
        selected ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
      )}
    >
      {/* Category icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
        style={{ backgroundColor: `${transaction.category?.color}20` }}
      >
        <span style={{ color: transaction.category?.color }}>
          {transaction.category?.icon ? '💰' : '•'}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {transaction.description}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {transaction.category?.name} · {formatRelativeDate(transaction.transaction_date)}
        </p>
      </div>

      {/* Amount */}
      <span
        className={cn(
          'text-sm font-semibold font-mono shrink-0',
          isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        )}
      >
        {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
      </span>
    </div>
  )
}
