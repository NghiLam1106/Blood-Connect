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
import { getHospitalChart, type TrendChartItem } from '../../services/hospital.service'

const FILTER_OPTIONS = [
  { label: '7 ngày', value: 7 },
  { label: '30 ngày', value: 30 },
  { label: '90 ngày', value: 90 },
]

function formatDateLabel(dateStr: string, days: number) {
  const d = new Date(dateStr)
  if (days === 7) return d.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric' })
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

interface TrendChartProps {
  userId: number
}

export function TrendChart({ userId }: TrendChartProps) {
  const [days, setDays] = useState(30)
  const [data, setData] = useState<TrendChartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getHospitalChart(userId, days)
      .then((res) => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [userId, days])

  const chartData = data.map((item) => ({
    ...item,
    dateLabel: formatDateLabel(item.date, days),
  }))

  const tickInterval = days === 90 ? 6 : days === 30 ? 3 : 0
  const barSize = days === 90 ? 4 : days === 30 ? 8 : 18

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-base font-bold text-dark">Xu hướng yêu cầu theo thời gian</h2>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                days === opt.value
                  ? 'bg-white text-accent shadow-sm'
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
          <span className="w-3 h-3 rounded-sm bg-accent inline-block" />
          Yêu cầu
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-3 h-3 rounded-sm bg-success inline-block" />
          Chấp nhận
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="h-[260px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-accent rounded-full animate-spin" />
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-[260px] flex items-center justify-center text-gray-400 text-sm">
          Không có dữ liệu trong khoảng thời gian này
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} barSize={barSize} barGap={2}>
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
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,0.05)' }} />
            <Bar dataKey="requests" name="Yêu cầu" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="accepted" name="Chấp nhận" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
