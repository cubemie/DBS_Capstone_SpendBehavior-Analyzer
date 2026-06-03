import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Target } from 'lucide-react'
import { budgetApi } from '@/api/budgetApi'
import { useNotification } from '@/hooks/useNotification'
import { getCurrentMonthYear, formatMonthYear } from '@/utils/formatDate'
import { MONTHS } from '@/utils/constants'
import BudgetCard from '@/components/budget/BudgetCard'
import BudgetForm from '@/components/budget/BudgetForm'
import Modal from '@/components/common/Modal'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import Button from '@/components/common/Button'
import Select from '@/components/common/Select'
import EmptyState from '@/components/common/EmptyState'

const { month: curMonth, year: curYear } = getCurrentMonthYear()

const monthOptions = MONTHS.map((label, i) => ({ value: i + 1, label }))
const yearOptions = Array.from({ length: 5 }, (_, i) => {
  const y = curYear - 2 + i
  return { value: y, label: String(y) }
})

export default function BudgetPage() {
  const qc = useQueryClient()
  const { toast } = useNotification()

  const [period, setPeriod] = useState({ month: curMonth, year: curYear })
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['budgets', period.month, period.year],
    queryFn: () => budgetApi.getList(period),
  })

  const budgets = data?.data?.data || []

  const createMutation = useMutation({
    mutationFn: budgetApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Budget berhasil ditambahkan')
      setModalOpen(false)
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || 'Gagal menambahkan budget'
      toast.error(msg)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => budgetApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Budget berhasil diperbarui')
      setEditTarget(null)
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Gagal memperbarui budget'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => budgetApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Budget berhasil dihapus')
      setDeleteTarget(null)
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Gagal menghapus budget'),
  })

  const handleCreate = (formData) => createMutation.mutate(formData)
  const handleUpdate = (formData) => updateMutation.mutate({ id: editTarget.id, data: formData })
  const handleDelete = () => deleteMutation.mutate(deleteTarget.id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Budget</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {formatMonthYear(period.month, period.year)}
          </p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
          Set Budget
        </Button>
      </div>

      {/* Period selector */}
      <div className="flex gap-3 max-w-xs">
        <Select
          options={monthOptions}
          value={period.month}
          onChange={(e) => setPeriod((prev) => ({ ...prev, month: Number(e.target.value) }))}
        />
        <Select
          options={yearOptions}
          value={period.year}
          onChange={(e) => setPeriod((prev) => ({ ...prev, year: Number(e.target.value) }))}
        />
      </div>

      {/* Budget Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-36 rounded-xl" />
          ))}
        </div>
      ) : budgets.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              onEdit={(b) => setEditTarget(b)}
              onDelete={(b) => setDeleteTarget(b)}
            />
          ))}
        </div>
      ) : (
        <div className="card">
          <EmptyState
            icon={Target}
            title="Belum ada budget"
            description="Set budget bulanan untuk mulai memantau pengeluaranmu"
            action={
              <Button icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
                Set Budget
              </Button>
            }
          />
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Set Budget Baru">
        <BudgetForm
          defaultValues={{ month: period.month, year: period.year }}
          onSubmit={handleCreate}
          isSubmitting={createMutation.isPending}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Budget"
      >
        <BudgetForm
          defaultValues={editTarget ? {
            id: editTarget.id,
            category_id: editTarget.category?.id,
            amount: editTarget.amount,
            month: editTarget.month,
            year: editTarget.year,
          } : undefined}
          onSubmit={handleUpdate}
          isSubmitting={updateMutation.isPending}
          onCancel={() => setEditTarget(null)}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Budget"
        message={`Yakin ingin menghapus budget kategori "${deleteTarget?.category?.name}"?`}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
