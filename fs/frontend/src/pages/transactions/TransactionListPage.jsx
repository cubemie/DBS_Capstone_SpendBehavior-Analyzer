import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, ArrowLeftRight } from 'lucide-react'
import { transactionApi } from '@/api/transactionApi'
import { useNotification } from '@/hooks/useNotification'
import { useDebounce } from '@/hooks/useDebounce'
import TransactionTable from '@/components/transactions/TransactionTable'
import TransactionFilter from '@/components/transactions/TransactionFilter'
import TransactionForm from '@/components/transactions/TransactionForm'
import TransactionDetail from '@/components/transactions/TransactionDetail'
import Pagination from '@/components/common/Pagination'
import Modal from '@/components/common/Modal'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import Button from '@/components/common/Button'
import EmptyState from '@/components/common/EmptyState'

const DEFAULT_FILTERS = {
  type: 'all',
  category_id: null,
  from_date: null,
  to_date: null,
  search: '',
  page: 1,
  limit: 20,
}

export default function TransactionListPage() {
  const qc = useQueryClient()
  const { toast } = useNotification()

  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [selected, setSelected] = useState(null)
  const [mode, setMode] = useState(null) // 'view' | 'create' | 'edit'
  const [deleteTarget, setDeleteTarget] = useState(null)

  const debouncedSearch = useDebounce(filters.search)

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', { ...filters, search: debouncedSearch }],
    queryFn: () =>
      transactionApi.getList({
        ...filters,
        search: debouncedSearch || undefined,
        type: filters.type === 'all' ? undefined : filters.type,
        category_id: filters.category_id || undefined,
        from_date: filters.from_date || undefined,
        to_date: filters.to_date || undefined,
      }),
    placeholderData: (prev) => prev,
  })

  const transactions = data?.data?.data?.items || []
  const pagination = data?.data?.data?.pagination

  const createMutation = useMutation({
    mutationFn: transactionApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Transaksi berhasil ditambahkan')
      setMode(null)
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Gagal menambahkan transaksi'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => transactionApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Transaksi berhasil diperbarui')
      setMode(null)
      setSelected(null)
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Gagal memperbarui transaksi'),
  })

  const deleteMutation = useMutation({
    mutationFn: transactionApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Transaksi berhasil dihapus')
      setDeleteTarget(null)
      setMode(null)
      setSelected(null)
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Gagal menghapus transaksi'),
  })

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  const handleRowClick = (tx) => {
    setSelected(tx)
    setMode('view')
  }

  const handleCreate = (data) => createMutation.mutate(data)
  const handleUpdate = (data) => updateMutation.mutate({ id: selected.id, data })
  const handleDelete = () => deleteMutation.mutate(deleteTarget.id)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Transaksi</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {pagination?.total ?? '—'} total transaksi
          </p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => { setSelected(null); setMode('create') }}>
          Tambah
        </Button>
      </div>

      {/* Filter */}
      <TransactionFilter
        filters={filters}
        onChange={handleFilterChange}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      {/* Table */}
      <div className="card p-4">
        {!isLoading && !transactions.length ? (
          <EmptyState
            icon={ArrowLeftRight}
            title="Belum ada transaksi"
            description="Mulai catat pengeluaran atau pemasukanmu"
            action={
              <Button icon={<Plus className="w-4 h-4" />} onClick={() => setMode('create')}>
                Tambah Transaksi
              </Button>
            }
          />
        ) : (
          <>
            <TransactionTable
              transactions={transactions}
              onRowClick={handleRowClick}
              loading={isLoading}
            />
            {pagination && (
              <Pagination
                page={pagination.page}
                totalPages={pagination.total_pages}
                total={pagination.total}
                limit={pagination.limit}
                onPageChange={(p) => handleFilterChange('page', p)}
              />
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={mode === 'view'}
        onClose={() => { setMode(null); setSelected(null) }}
        title="Detail Transaksi"
      >
        <TransactionDetail
          transaction={selected}
          onEdit={(tx) => { setSelected(tx); setMode('edit') }}
          onDelete={(tx) => setDeleteTarget(tx)}
        />
      </Modal>

      {/* Create Modal */}
      <Modal
        isOpen={mode === 'create'}
        onClose={() => setMode(null)}
        title="Tambah Transaksi"
        size="lg"
      >
        <TransactionForm
          onSubmit={handleCreate}
          isSubmitting={createMutation.isPending}
          onCancel={() => setMode(null)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={mode === 'edit'}
        onClose={() => setMode('view')}
        title="Edit Transaksi"
        size="lg"
      >
        <TransactionForm
          defaultValues={selected ? {
            ...selected,
            category_id: selected.category?.id,
          } : undefined}
          onSubmit={handleUpdate}
          isSubmitting={updateMutation.isPending}
          onCancel={() => setMode('view')}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Transaksi"
        message={`Yakin ingin menghapus transaksi "${deleteTarget?.description}"? Tindakan ini tidak dapat dibatalkan.`}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
