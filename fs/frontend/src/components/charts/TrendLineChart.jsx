import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-3 shadow-modal text-sm">
      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.stroke }} />
          <span className="text-gray-500 dark:text-gray-400">{entry.name}:</span>
          <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * TrendLineChart
 * @param {Array} data - [{date, income, expense}]
 */
export default function TrendLineChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-600 text-sm">
        Belum ada data
      </div>
    )
  }

  const formatted = data.map((d) => ({
    ...d,
    label: formatDate(d.date, 'dd MMM'),
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={formatted} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={(v) => formatCurrency(v, { compact: true, showSymbol: false })}
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span className="text-xs text-gray-600 dark:text-gray-400">{value}</span>}
        />
        <Line
          type="monotone"
          dataKey="income"
          name="Pemasukan"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="expense"
          name="Pengeluaran"
          stroke="#ef4444"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
