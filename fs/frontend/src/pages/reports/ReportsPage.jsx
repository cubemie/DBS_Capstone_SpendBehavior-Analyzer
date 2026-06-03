import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, BarChart2 } from 'lucide-react'
import { reportApi } from '@/api/reportApi'
import { getCurrentMonthYear, formatMonthYear } from '@/utils/formatDate'
import { formatCurrency } from '@/utils/formatCurrency'
import { MONTHS } from '@/utils/constants'
import { useNotification } from '@/hooks/useNotification'
import SpendingPieChart from '@/components/charts/SpendingPieChart'
import MonthlyBarChart from '@/components/charts/MonthlyBarChart'
import TrendLineChart from '@/components/charts/TrendLineChart'
import StatsCard from '@/components/ui/StatsCard'
import Select from '@/components/common/Select'
import Button from '@/components/common/Button'
import EmptyState from '@/components/common/EmptyState'
import { TrendingDown, TrendingUp, Calendar } from 'lucide-react'

const { month: curMonth, year: curYear } = getCurrentMonthYear()

const monthOptions = MONTHS.map((label, i) => ({ value: i + 1, label }))
const yearOptions = Array.from({ length: 5 }, (_, i) => {
  const y = curYear - 2 + i
  return { value: y, label: String(y) }
})

export default function ReportsPage() {
  const { toast } = useNotification()
  const [period, setPeriod] = useState({ month: curMonth, year: curYear })
  const [exporting, setExporting] = useState(null) // 'pdf' | 'csv'

  const { data: summaryRes, isLoading: loadingSummary } = useQuery({
    queryKey: ['reports/summary', period.month, period.year],
    queryFn: () => reportApi.getSummary(period),
  })

  const { data: categoryRes, isLoading: loadingCategory } = useQuery({
    queryKey: ['reports/by-category', period.month, period.year],
    queryFn: () => reportApi.getByCategory({ ...period, type: 'expense' }),
  })

  const { data: monthlyRes, isLoading: loadingMonthly } = useQuery({
    queryKey: ['reports/monthly-trend', period.year],
    queryFn: () => reportApi.getMonthlyTrend({ year: period.year }),
  })

  const { data: dailyRes, isLoading: loadingDaily } = useQuery({
    queryKey: ['reports/daily-trend', period.month, period.year],
    queryFn: () => reportApi.getDailyTrend(period),
  })

  const summary = summaryRes?.data?.data
  const categories = categoryRes?.data?.data || []
  const monthly = monthlyRes?.data?.data || []
  const daily = dailyRes?.data?.data || []

  const handleExport = async (format) => {
    setExporting(format)
    try {
      const from = `${period.year}-${String(period.month).padStart(2, '0')}-01`
      const lastDay = new Date(period.year, period.month, 0).getDate()
      const to = `${period.year}-${String(period.month).padStart(2, '0')}-${lastDay}`

      const res = await reportApi.export({ from_date: from, to_date: to, format })
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `budu-report-${period.year}-${period.month}.${format}`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Laporan ${format.toUpperCase()} berhasil diunduh`)
    } catch {
      toast.error('Gagal mengunduh laporan')
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title">Laporan & Analitik</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {formatMonthYear(period.month, period.year)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-2">
            <Select
              options={monthOptions}
              value={period.month}
              onChange={(e) => setPeriod((p) => ({ ...p, month: Number(e.target.value) }))}
              className="text-sm"
            />
            <Select
              options={yearOptions}
              value={period.year}
              onChange={(e) => setPeriod((p) => ({ ...p, year: Number(e.target.value) }))}
              className="text-sm"
            />
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            loading={exporting === 'csv'}
            onClick={() => handleExport('csv')}
          >
            CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            loading={exporting === 'pdf'}
            onClick={() => handleExport('pdf')}
          >
            PDF
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Pemasukan"
          value={formatCurrency(summary?.total_income)}
          change={summary?.comparison?.income_change_pct}
          icon={TrendingUp}
          color="green"
          loading={loadingSummary}
        />
        <StatsCard
          title="Total Pengeluaran"
          value={formatCurrency(summary?.total_expense)}
          change={summary?.comparison?.expense_change_pct}
          icon={TrendingDown}
          color="red"
          loading={loadingSummary}
        />
        <StatsCard
          title="Rata-rata Harian"
          value={formatCurrency(summary?.avg_daily_expense)}
          icon={Calendar}
          color="amber"
          loading={loadingSummary}
        />
        <StatsCard
          title="Total Transaksi"
          value={summary?.total_transactions ?? '—'}
          icon={BarChart2}
          color="blue"
          loading={loadingSummary}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="section-title mb-4">Pengeluaran per Kategori</h2>
          {loadingCategory ? (
            <div className="skeleton h-64 rounded-xl" />
          ) : categories.length ? (
            <SpendingPieChart data={categories} />
          ) : (
            <EmptyState icon={BarChart2} title="Tidak ada data" description="Tidak ada pengeluaran pada periode ini" />
          )}
        </div>

        <div className="card p-5">
          <h2 className="section-title mb-4">Tren Harian</h2>
          {loadingDaily ? (
            <div className="skeleton h-64 rounded-xl" />
          ) : daily.length ? (
            <TrendLineChart data={daily} />
          ) : (
            <EmptyState icon={BarChart2} title="Tidak ada data" description="Tidak ada transaksi pada periode ini" />
          )}
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Tren Bulanan {period.year}</h2>
        {loadingMonthly ? (
          <div className="skeleton h-72 rounded-xl" />
        ) : monthly.length ? (
          <MonthlyBarChart data={monthly} />
        ) : (
          <EmptyState icon={BarChart2} title="Tidak ada data" description="Tidak ada data transaksi tahun ini" />
        )}
      </div>

      {/* Category Breakdown Table */}
      {categories.length > 0 && (
        <div className="card p-5">
          <h2 className="section-title mb-4">Rincian per Kategori</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {['Kategori', 'Transaksi', 'Total', 'Persentase'].map((h) => (
                    <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {categories.map((item) => (
                  <tr key={item.category?.id}>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.category?.color }} />
                        <span className="font-medium text-gray-900 dark:text-white">{item.category?.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-500 dark:text-gray-400">{item.transaction_count}</td>
                    <td className="py-3 px-3 font-semibold font-mono text-gray-900 dark:text-white">
                      {formatCurrency(item.total)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full max-w-[80px]">
                          <div
                            className="h-full rounded-full bg-primary-500"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                          {item.percentage?.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
