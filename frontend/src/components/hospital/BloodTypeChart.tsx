import { useEffect, useState } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { getBloodTypeDistribution, type BloodTypeItem } from '../../services/hospital.service'

// Màu theo nhóm máu — fallback cho các nhóm không liệt kê
const BLOOD_TYPE_COLORS: Record<string, string> = {
  'A+': '#ef4444',
  'A-': '#f87171',
  'B+': '#f97316',
  'B-': '#fb923c',
  'O+': '#dc2626',
  'O-': '#b91c1c',
  'AB+': '#8b5cf6',
  'AB-': '#a78bfa',
}
const FALLBACK_COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ec4899', '#14b8a6']

function getColor(bloodType: string, idx: number) {
  return BLOOD_TYPE_COLORS[bloodType] ?? FALLBACK_COLORS[idx % FALLBACK_COLORS.length]
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0]
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm">
        <p className="font-bold text-dark mb-0.5">{name}</p>
        <p className="text-gray-500">{value} ca hiến máu</p>
      </div>
    )
  }
  return null
}

const renderCustomLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: any) => {
  if (percent < 0.05) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

interface BloodTypeChartProps {
  userId: number
}

export function BloodTypeChart({ userId }: BloodTypeChartProps) {
  const [data, setData] = useState<BloodTypeItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBloodTypeDistribution(userId)
      .then((res) => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [userId])

  const chartData = data.map((item) => ({ name: item.bloodType, value: item.count }))

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full">
      <h2 className="text-base font-bold text-dark mb-5">Phân bố nhóm máu</h2>

      {loading ? (
        <div className="h-[260px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-accent rounded-full animate-spin" />
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-[260px] flex flex-col items-center justify-center gap-2 text-gray-400 text-sm">
          <span>Chưa có dữ liệu hiến máu</span>
          <span className="text-xs">(chỉ tính ca đã hoàn thành)</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={95}
              dataKey="value"
              labelLine={false}
              label={renderCustomLabel}
            >
              {chartData.map((entry, idx) => (
                <Cell key={entry.name} fill={getColor(entry.name, idx)} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span className="text-xs text-gray-600 font-semibold">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
