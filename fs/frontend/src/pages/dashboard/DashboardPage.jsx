import { useQuery } from '@tanstack/react-query'
import { Wallet, TrendingDown, TrendingUp, Receipt, BarChart2, Target } from 'lucide-react'
import { reportApi } from '@/api/reportApi'
import { transactionApi } from '@/api/transactionApi'
import { budgetApi } from '@/api/budgetApi'
import { getCurrentMonthYear, formatMonthYear } from '@/utils/formatDate'
import { formatCurrency } from '@/utils/formatCurrency'
import StatsCard from '@/components/ui/StatsCard'
import BudgetProgressBar from '@/components/ui/BudgetProgressBar'
import SpendingPieChart from '@/components/charts/SpendingPieChart'
import MonthlyBarChart from '@/components/charts/MonthlyBarChart'
import TransactionRow from '@/components/transactions/TransactionRow'
import EmptyState from '@/components/common/EmptyState'

const { month, year } = getCurrentMonthYear()

export default function DashboardPage() {
  const { data: summaryRes, isLoading: loadingSummary } = useQuery({
    queryKey: ['reports/summary', month, year],
    queryFn: () => reportApi.getSummary({ month, year }),
  })

  const { data: categoryRes, isLoading: loadingCategory } = useQuery({
    queryKey: ['reports/by-category', month, year],
    queryFn: () => reportApi.getByCategory({ month, year, type: 'expense' }),
  })

  const { data: monthlyRes, isLoading: loadingMonthly } = useQuery({
    queryKey: ['reports/monthly-trend', year],
    queryFn: () => reportApi.getMonthlyTrend({ year }),
  })

  const { data: recentRes, isLoading: loadingRecent } = useQuery({
    queryKey: ['transactions', 'recent'],
    queryFn: () => transactionApi.getList({ limit: 5, sort_by: 'date', sort_order: 'desc' }),
  })

  const { data: budgetRes, isLoading: loadingBudget } = useQuery({
    queryKey: ['budgets', month, year],
    queryFn: () => budgetApi.getList({ month, year }),
  })

  const summary = summaryRes?.data?.data
  const categories = categoryRes?.data?.data || []
  const monthly = monthlyRes?.data?.data || []
  const recent = recentRes?.data?.data?.items || []
  const budgets = budgetRes?.data?.data || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Ringkasan keuangan {formatMonthYear(month, year)}
        </p>
      </div>

      {/* Stats Cards */}
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
          title="Saldo Bulan Ini"
          value={formatCurrency(summary?.balance)}
          icon={Wallet}
          color="primary"
          loading={loadingSummary}
        />
        <StatsCard
          title="Total Transaksi"
          value={summary?.total_transactions ?? '—'}
          icon={Receipt}
          color="blue"
          loading={loadingSummary}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <div className="card p-5">
          <h2 className="section-title mb-4">Pengeluaran per Kategori</h2>
          {loadingCategory ? (
            <div className="skeleton h-64 rounded-xl" />
          ) : (
            <SpendingPieChart data={categories} />
          )}
        </div>

        {/* Bar Chart */}
        <div className="card p-5">
          <h2 className="section-title mb-4">Tren Bulanan {year}</h2>
          {loadingMonthly ? (
            <div className="skeleton h-64 rounded-xl" />
          ) : (
            <MonthlyBarChart data={monthly} />
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Transactions */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Transaksi Terbaru</h2>
            <a href="/transactions" className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium">
              Lihat semua
            </a>
          </div>
          {loadingRecent ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton h-14 rounded-xl" />
              ))}
            </div>
          ) : recent.length ? (
            <div className="space-y-1">
              {recent.map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} />
              ))}
            </div>
          ) : (
            <EmptyState icon={Receipt} title="Belum ada transaksi" description="Mulai tambahkan transaksi Anda" />
          )}
        </div>

        {/* Budget Overview */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Budget Bulan Ini</h2>
            <a href="/budget" className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium">
              Kelola
            </a>
          </div>
          {loadingBudget ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton h-12 rounded-xl" />
              ))}
            </div>
          ) : budgets.length ? (
            <div className="space-y-4">
              {budgets.slice(0, 4).map((b) => (
                <BudgetProgressBar
                  key={b.id}
                  spent={Number(b.spent)}
                  budget={Number(b.amount)}
                  label={b.category?.name}
                  color={b.category?.color}
                />
              ))}
            </div>
          ) : (
            <EmptyState icon={Target} title="Belum ada budget" description="Set budget untuk mulai memantau pengeluaran" />
          )}
        </div>
      </div>
    </div>
  )
}
