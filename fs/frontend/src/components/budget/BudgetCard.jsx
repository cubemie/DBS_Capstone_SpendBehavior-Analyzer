import { Pencil, Trash2 } from 'lucide-react'
import BudgetProgressBar from '@/components/ui/BudgetProgressBar'
import { formatCurrency } from '@/utils/formatCurrency'

export default function BudgetCard({ budget, onEdit, onDelete }) {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: budget.category?.color }}
          />
          <p className="font-semibold text-gray-900 dark:text-white text-sm">
            {budget.category?.name}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(budget)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            title="Edit budget"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(budget)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Hapus budget"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <BudgetProgressBar
        spent={Number(budget.spent)}
        budget={Number(budget.amount)}
        label=""
      />

      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Budget: <strong className="text-gray-700 dark:text-gray-300">{formatCurrency(budget.amount)}</strong></span>
        <span>Terpakai: <strong className="text-gray-700 dark:text-gray-300">{formatCurrency(budget.spent)}</strong></span>
      </div>
    </div>
  )
}
