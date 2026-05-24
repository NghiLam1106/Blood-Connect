import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { RecentTrafficItem } from '../../services/admin.service'
import { getRecentTraffic } from '../../services/admin.service'

function relativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Vừa xong'
  if (diffMin < 60) return `${diffMin} phút trước`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr} giờ trước`
  const diffDay = Math.floor(diffHr / 24)
  return `${diffDay} ngày trước`
}

const STATUS_BADGE: Record<string, string> = {
  'Cực kỳ khẩn cấp': 'bg-red-100 text-red-700 border border-red-300',
  'Khẩn cấp':        'bg-red-50 text-red-500 border border-red-200',
  'Ưu tiên':         'bg-orange-50 text-orange-500 border border-orange-200',
  'Ưu tiên thấp':    'bg-yellow-50 text-yellow-600 border border-yellow-200',
  'Bình thường':     'bg-gray-50 text-gray-400 border border-gray-200',
  'Đã xử lý':        'bg-emerald-50 text-emerald-600 border border-emerald-200',
  'Từ chối':         'bg-gray-50 text-gray-400 border border-gray-200 line-through',
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-gray-50">
      <div className="flex flex-col gap-1.5">
        <div className="h-3.5 w-28 bg-gray-200 rounded animate-pulse" />
        <div className="h-2.5 w-16 bg-gray-100 rounded animate-pulse" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-4 w-8 bg-red-100 rounded animate-pulse" />
        <div className="h-3 w-14 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
  )
}

export function RecentTraffic() {
  const navigate = useNavigate()
  const [items, setItems] = useState<RecentTrafficItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRecentTraffic(5)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 h-full p-6"
      style={{ boxShadow: '0 4px 20px -4px rgba(0,0,0,0.05)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-extrabold text-dark">Lưu lượng gần đây</h2>
        <span
          className="text-xs text-primary font-bold cursor-pointer hover:underline"
          onClick={() => navigate('/admin/hospitals')}
        >
          Chi tiết
        </span>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Chưa có dữ liệu</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-sm text-dark leading-tight">
                  {item.hospitalName}
                </span>
                <span className="text-xs text-gray-400">{relativeTime(item.createdAt)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-red-50 text-primary px-2 py-0.5 rounded text-[10px] font-bold border border-red-100">
                  {item.bloodType}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${STATUS_BADGE[item.status] ?? 'bg-gray-50 text-gray-400 border border-gray-200'}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
