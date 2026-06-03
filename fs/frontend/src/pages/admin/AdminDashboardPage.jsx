import { useQuery } from '@tanstack/react-query'
import { Users, UserCheck, UserPlus, ArrowLeftRight, BarChart2 } from 'lucide-react'
import { adminApi } from '@/api/adminApi'
import StatsCard from '@/components/ui/StatsCard'

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin/overview'],
    queryFn: () => adminApi.getOverview(),
  })

  const stats = data?.data?.data

  const cards = [
    { title: 'Total Pengguna', value: stats?.total_users, icon: Users, color: 'primary' },
    { title: 'Aktif Hari Ini', value: stats?.active_users_today, icon: UserCheck, color: 'green' },
    { title: 'User Baru Bulan Ini', value: stats?.new_users_this_month, icon: UserPlus, color: 'blue' },
    { title: 'Total Transaksi', value: stats?.total_transactions, icon: ArrowLeftRight, color: 'amber' },
    { title: 'Transaksi Bulan Ini', value: stats?.transactions_this_month, icon: BarChart2, color: 'purple' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Statistik platform BUDU</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((c) => (
          <StatsCard
            key={c.title}
            title={c.title}
            value={c.value ?? '—'}
            icon={c.icon}
            color={c.color}
            loading={isLoading}
          />
        ))}
      </div>
    </div>
  )
}
