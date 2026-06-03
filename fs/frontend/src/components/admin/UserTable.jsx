import UserRow from './UserRow'

const HEADERS = ['Pengguna', 'Role', 'Status', 'Transaksi', 'Bergabung', 'Aksi']

export default function UserTable({ users = [], loading, onView, onToggleStatus, onDelete }) {
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
            {HEADERS.map((h) => (
              <th
                key={h}
                className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
          {users.map((u) => (
            <UserRow
              key={u.id}
              user={u}
              onView={onView}
              onToggleStatus={onToggleStatus}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
