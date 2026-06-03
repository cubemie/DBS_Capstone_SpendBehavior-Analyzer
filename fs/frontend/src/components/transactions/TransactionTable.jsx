import { formatDate } from '@/utils/formatDate'
import { formatCurrency } from '@/utils/formatCurrency'
import TransactionTypeBadge from '@/components/ui/TransactionTypeBadge'
import { cn } from '@/utils/classNames'

export default function TransactionTable({ transactions = [], onRowClick, loading }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton h-14 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-800">
            {['Tanggal', 'Deskripsi', 'Kategori', 'Tipe', 'Nominal'].map((h) => (
              <th
                key={h}
                className="text-left py-3 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
          {transactions.map((tx) => (
            <tr
              key={tx.id}
              onClick={() => onRowClick?.(tx)}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
            >
              <td className="py-3 px-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {formatDate(tx.transaction_date, 'dd MMM yyyy')}
              </td>
              <td className="py-3 px-3 font-medium text-gray-900 dark:text-white max-w-[200px] truncate">
                {tx.description}
              </td>
              <td className="py-3 px-3">
                <div className="flex items-center gap-2">
                  {tx.category?.color && (
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: tx.category.color }}
                    />
                  )}
                  <span className="text-gray-600 dark:text-gray-400 truncate">
                    {tx.category?.name || '—'}
                  </span>
                </div>
              </td>
              <td className="py-3 px-3">
                <TransactionTypeBadge type={tx.type} showIcon={false} />
              </td>
              <td className={cn(
                'py-3 px-3 font-semibold font-mono whitespace-nowrap',
                tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              )}>
                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
