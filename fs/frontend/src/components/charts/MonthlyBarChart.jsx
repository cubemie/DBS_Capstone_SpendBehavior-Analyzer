import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/utils/formatCurrency'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-3 shadow-modal text-sm">
      <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.fill }} />
          <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
          <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * MonthlyBarChart
 * @param {Array} data - [{month, label, income, expense}]
 */
export default function MonthlyBarChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-600 text-sm">
        Belum ada data
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }} barSize={16} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => formatCurrency(v, { compact: true, showSymbol: false })}
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
        <Legend
          iconType="square"
          iconSize={8}
          formatter={(value) => <span className="text-xs text-gray-600 dark:text-gray-400">{value}</span>}
        />
        <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
