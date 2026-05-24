import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DemandChartItem } from '../../services/admin.service'
import { getDemandChart } from '../../services/admin.service'

const FILTER_OPTIONS = [
  { label: '7 ngày', value: 7 },
  { label: '30 ngày', value: 30 },
  { label: '90 ngày', value: 90 },
]

function formatDateLabel(dateStr: string, days: number) {
  const d = new Date(dateStr)
  if (days === 7) {
    return d.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric' })
  }
  return `${d.getDate()}/${d.getMonth() + 1}`
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm">
        <p className="font-bold text-dark mb-1">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.dataKey} style={{ color: entry.color }} className="font-semibold">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function DemandChart() {
  const [days, setDays] = useState(30)
  const [data, setData] = useState<DemandChartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getDemandChart(days)
      .then((res) => setData(res))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [days])

  const chartData = data.map((item) => ({
    ...item,
    dateLabel: formatDateLabel(item.date, days),
  }))

  // Ticks hiển thị (giảm số lượng nhãn nếu quá nhiều ngày)
  const tickInterval = days === 90 ? 6 : days === 30 ? 3 : 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full" style={{ boxShadow: '0 4px 20px -4px rgba(0,0,0,0.05)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-lg font-extrabold text-dark">Biểu đồ yêu cầu &amp; đáp ứng</h2>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                days === opt.value
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-3 h-3 rounded-sm bg-purple-500 inline-block" />
          Yêu cầu
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" />
          Đáp ứng
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="h-[280px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} barSize={days === 90 ? 4 : days === 30 ? 8 : 18} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              interval={tickInterval}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              width={28}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139,92,246,0.05)' }} />
            <Bar dataKey="requests" name="Yêu cầu" fill="#a855f7" radius={[4, 4, 0, 0]} />
            <Bar dataKey="responses" name="Đáp ứng" fill="#34d399" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
