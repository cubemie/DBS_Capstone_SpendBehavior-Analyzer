import { formatDate } from '@/utils/formatDate'
import { formatCurrency } from '@/utils/formatCurrency'
import TransactionTypeBadge from '@/components/ui/TransactionTypeBadge'
import Button from '@/components/common/Button'
import { Pencil, Trash2 } from 'lucide-react'

export default function TransactionDetail({ transaction, onEdit, onDelete }) {
  if (!transaction) return null

  const rows = [
    { label: 'Tipe', value: <TransactionTypeBadge type={transaction.type} /> },
    { label: 'Nominal', value: formatCurrency(transaction.amount) },
    { label: 'Kategori', value: transaction.category?.name || '—' },
    { label: 'Tanggal', value: formatDate(transaction.transaction_date) },
    { label: 'Deskripsi', value: transaction.description },
    ...(transaction.notes ? [{ label: 'Catatan', value: transaction.notes }] : []),
    { label: 'Dibuat', value: formatDate(transaction.created_at, 'dd MMM yyyy, HH:mm') },
  ]

  return (
    <div className="space-y-4">
      <dl className="divide-y divide-gray-100 dark:divide-gray-800">
        {rows.map(({ label, value }) => (
          <div key={label} className="py-3 flex justify-between items-start gap-4">
            <dt className="text-sm text-gray-500 dark:text-gray-400 shrink-0">{label}</dt>
            <dd className="text-sm font-medium text-gray-900 dark:text-white text-right">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex gap-3 pt-2">
        <Button
          variant="secondary"
          fullWidth
          icon={<Pencil className="w-4 h-4" />}
          onClick={() => onEdit(transaction)}
        >
          Edit
        </Button>
        <Button
          variant="danger-ghost"
          fullWidth
          icon={<Trash2 className="w-4 h-4" />}
          onClick={() => onDelete(transaction)}
        >
          Hapus
        </Button>
      </div>
    </div>
  )
}
