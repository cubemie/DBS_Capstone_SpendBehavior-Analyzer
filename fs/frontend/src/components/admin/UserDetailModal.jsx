import Modal from '@/components/common/Modal'
import Avatar from '@/components/common/Avatar'
import Badge from '@/components/common/Badge'
import Button from '@/components/common/Button'
import { formatDate } from '@/utils/formatDate'
import { ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'

export default function UserDetailModal({ user, onClose, onToggleStatus, onDelete }) {
  if (!user) return null

  const rows = [
    { label: 'ID', value: <span className="font-mono text-xs break-all">{user.id}</span> },
    { label: 'Email', value: user.email },
    { label: 'Role', value: <Badge color={user.role === 'admin' ? 'purple' : 'blue'}>{user.role}</Badge> },
    { label: 'Status', value: <Badge color={user.is_active ? 'green' : 'gray'} dot>{user.is_active ? 'Aktif' : 'Nonaktif'}</Badge> },
    { label: 'Transaksi', value: user.transaction_count ?? '—' },
    { label: 'Login Terakhir', value: user.last_login_at ? formatDate(user.last_login_at, 'dd MMM yyyy, HH:mm') : 'Belum pernah' },
    { label: 'Bergabung', value: formatDate(user.created_at) },
  ]

  return (
    <Modal isOpen={!!user} onClose={onClose} title="Detail Pengguna">
      <div className="space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
          <Avatar src={user.avatar_url} name={user.name} size="lg" />
          <div>
            <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </div>

        <dl className="divide-y divide-gray-100 dark:divide-gray-800">
          {rows.map(({ label, value }) => (
            <div key={label} className="py-2.5 flex justify-between items-center gap-4">
              <dt className="text-sm text-gray-500 dark:text-gray-400 shrink-0">{label}</dt>
              <dd className="text-sm font-medium text-gray-900 dark:text-white text-right">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary"
            fullWidth
            icon={user.is_active ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
            onClick={() => onToggleStatus(user)}
          >
            {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
          </Button>
          <Button
            variant="danger-ghost"
            fullWidth
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => onDelete(user)}
          >
            Hapus
          </Button>
        </div>
      </div>
    </Modal>
  )
}
