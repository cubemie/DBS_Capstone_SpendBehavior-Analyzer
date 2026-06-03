import { MoreHorizontal, Eye, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { formatDate } from '@/utils/formatDate'
import Avatar from '@/components/common/Avatar'
import Badge from '@/components/common/Badge'
import { useClickOutside } from '@/hooks/useClickOutside'

export default function UserRow({ user, onView, onToggleStatus, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  useClickOutside(menuRef, () => setMenuOpen(false))

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <Avatar src={user.avatar_url} name={user.name} size="sm" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <Badge color={user.role === 'admin' ? 'purple' : 'blue'} size="sm">
          {user.role}
        </Badge>
      </td>
      <td className="py-3 px-4">
        <Badge color={user.is_active ? 'green' : 'gray'} dot size="sm">
          {user.is_active ? 'Aktif' : 'Nonaktif'}
        </Badge>
      </td>
      <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
        {user.transaction_count ?? '—'}
      </td>
      <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
        {formatDate(user.created_at)}
      </td>
      <td className="py-3 px-4">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 w-44 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-modal z-10 animate-slide-in">
              <div className="p-1 space-y-0.5">
                <button
                  onClick={() => { onView(user); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" /> Detail
                </button>
                <button
                  onClick={() => { onToggleStatus(user); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {user.is_active ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                  {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
                <button
                  onClick={() => { onDelete(user); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Hapus
                </button>
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}
