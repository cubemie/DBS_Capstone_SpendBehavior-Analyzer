import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { transactionApi } from '@/api/transactionApi'
import { useNotification } from '@/hooks/useNotification'
import TransactionDetail from '@/components/transactions/TransactionDetail'
import TransactionForm from '@/components/transactions/TransactionForm'
import Modal from '@/components/common/Modal'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import Button from '@/components/common/Button'
import Spinner from '@/components/common/Spinner'

export default function TransactionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { toast } = useNotification()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['transaction', id],
    queryFn: () => transactionApi.getById(id),
    enabled: !!id,
  })

  const transaction = data?.data?.data

  const updateMutation = useMutation({
    mutationFn: (formData) => transactionApi.update(id, formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transaction', id] })
      qc.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Transaksi berhasil diperbarui')
      setEditOpen(false)
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Gagal memperbarui transaksi'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => transactionApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Transaksi berhasil dihapus')
      navigate('/transactions')
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Gagal menghapus transaksi'),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isError || !transaction) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 dark:text-gray-400 mb-4">Transaksi tidak ditemukan</p>
        <Button variant="secondary" onClick={() => navigate('/transactions')}>
          Kembali
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <Button
        variant="ghost"
        size="sm"
        icon={<ArrowLeft className="w-4 h-4" />}
        onClick={() => navigate('/transactions')}
      >
        Kembali
      </Button>

      <div className="card p-6">
        <h1 className="page-title mb-6">Detail Transaksi</h1>
        <TransactionDetail
          transaction={transaction}
          onEdit={() => setEditOpen(true)}
          onDelete={() => setDeleteOpen(true)}
        />
      </div>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Transaksi" size="lg">
        <TransactionForm
          defaultValues={{ ...transaction, category_id: transaction.category?.id }}
          onSubmit={(data) => updateMutation.mutate(data)}
          isSubmitting={updateMutation.isPending}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Hapus Transaksi"
        message={`Yakin ingin menghapus "${transaction.description}"?`}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
