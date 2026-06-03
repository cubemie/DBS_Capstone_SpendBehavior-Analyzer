import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Users } from 'lucide-react'
import { adminApi } from '@/api/adminApi'
import { useAuth } from '@/hooks/useAuth'
import { useNotification } from '@/hooks/useNotification'
import { useDebounce } from '@/hooks/useDebounce'
import UserTable from '@/components/admin/UserTable'
import UserDetailModal from '@/components/admin/UserDetailModal'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import Pagination from '@/components/common/Pagination'
import Input from '@/components/common/Input'
import Select from '@/components/common/Select'
import EmptyState from '@/components/common/EmptyState'

export default function AdminUsersPage() {
  const { user: me } = useAuth()
  const qc = useQueryClient()
  const { toast } = useNotification()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [viewUser, setViewUser] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const debouncedSearch = useDebounce(search)

  const { data, isLoading } = useQuery({
    queryKey: ['admin/users', page, debouncedSearch, roleFilter],
    queryFn: () =>
      adminApi.getUsers({
        page,
        limit: 20,
        search: debouncedSearch || undefined,
        role: roleFilter || undefined,
      }),
    placeholderData: (prev) => prev,
  })

  const users = data?.data?.data?.items || []
  const pagination = data?.data?.data?.pagination

  const statusMutation = useMutation({
    mutationFn: ({ id, is_active }) => adminApi.updateUserStatus(id, is_active),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin/users'] })
      toast.success(`User berhasil ${vars.is_active ? 'diaktifkan' : 'dinonaktifkan'}`)
      setViewUser(null)
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Gagal mengubah status user'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin/users'] })
      toast.success('User berhasil dihapus')
      setDeleteTarget(null)
      setViewUser(null)
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Gagal menghapus user'),
  })

  const handleToggleStatus = (u) => {
    statusMutation.mutate({ id: u.id, is_active: !u.is_active })
  }

  const handleDeleteRequest = (u) => {
    if (u.id === me?.id) {
      toast.error('Tidak dapat menghapus akun sendiri')
      return
    }
    setDeleteTarget(u)
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Kelola Pengguna</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {pagination?.total ?? '—'} total pengguna
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] max-w-sm">
          <Input
            placeholder="Cari nama atau email..."
            prefix={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <Select
          options={[
            { value: '', label: 'Semua Role' },
            { value: 'user', label: 'User' },
            { value: 'admin', label: 'Admin' },
          ]}
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
          className="w-36"
        />
      </div>

      {/* Table */}
      <div className="card p-4">
        {!isLoading && !users.length ? (
          <EmptyState icon={Users} title="Tidak ada pengguna" description="Tidak ada pengguna yang sesuai filter" />
        ) : (
          <>
            <UserTable
              users={users}
              loading={isLoading}
              onView={setViewUser}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteRequest}
            />
            {pagination && (
              <Pagination
                page={pagination.page}
                totalPages={pagination.total_pages}
                total={pagination.total}
                limit={pagination.limit}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      <UserDetailModal
        user={viewUser}
        onClose={() => setViewUser(null)}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteRequest}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        title="Hapus Pengguna"
        message={`Yakin ingin menghapus akun "${deleteTarget?.name}"? Semua data transaksi mereka akan ikut terhapus.`}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
