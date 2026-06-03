import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/api/adminApi'
import StatsCard from '@/components/ui/StatsCard'
import { Users, ArrowLeftRight, Activity } from 'lucide-react'

export default function AdminReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin/overview'],
    queryFn: () => adminApi.getOverview(),
  })

  const stats = data?.data?.data

  return (
    <div className="space-y-6">
      <h1 className="page-title">Laporan Platform</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Total Pengguna" value={stats?.total_users ?? '—'} icon={Users} color="primary" loading={isLoading} />
        <StatsCard title="Total Transaksi" value={stats?.total_transactions ?? '—'} icon={ArrowLeftRight} color="blue" loading={isLoading} />
        <StatsCard title="Transaksi Bulan Ini" value={stats?.transactions_this_month ?? '—'} icon={Activity} color="green" loading={isLoading} />
      </div>

      <div className="card p-6 text-center text-gray-400 dark:text-gray-600 text-sm">
        Laporan platform detail akan tersedia pada versi berikutnya.
      </div>
    </div>
  )
}
