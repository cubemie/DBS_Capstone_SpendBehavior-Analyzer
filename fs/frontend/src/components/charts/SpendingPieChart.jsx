import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency } from '@/utils/formatCurrency'

const RADIAN = Math.PI / 180
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
  if (percentage < 5) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-semibold" fontSize={11}>
      {`${percentage.toFixed(0)}%`}
    </text>
  )
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-3 shadow-modal text-sm">
      <p className="font-semibold text-gray-900 dark:text-white mb-1">{item.name}</p>
      <p className="text-gray-600 dark:text-gray-400">{formatCurrency(item.value)}</p>
      <p className="text-xs text-gray-400">{item.payload.percentage?.toFixed(1)}% dari total</p>
    </div>
  )
}

/**
 * SpendingPieChart
 * @param {Array} data - [{category: {name, color}, total, percentage}]
 */
export default function SpendingPieChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-600 text-sm">
        Belum ada data
      </div>
    )
  }

  const chartData = data.map((item) => ({
    name: item.category?.name || item.name,
    value: Number(item.total),
    color: item.category?.color || '#6b7280',
    percentage: item.percentage,
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          labelLine={false}
          label={renderCustomLabel}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span className="text-xs text-gray-700 dark:text-gray-300">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
