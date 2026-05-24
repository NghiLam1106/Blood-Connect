import SearchIcon from '@mui/icons-material/Search'
import { useEffect, useMemo, useState } from 'react'
import type { HospitalsTrafficItem } from '../../services/admin.service'
import { getHospitalsTraffic } from '../../services/admin.service'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const STATUS_OPTIONS = [
  { label: 'Tất cả', value: '' },
  { label: 'Khẩn cấp', value: 'urgent' },
  { label: 'Bình thường', value: 'normal' },
  { label: 'Đã xử lý', value: 'resolved' },
  { label: 'Từ chối', value: 'rejected' },
]

const STATUS_BADGE: Record<string, string> = {
  'Cực kỳ khẩn cấp': 'bg-red-100 text-red-700 border border-red-300',
  'Khẩn cấp':        'bg-red-50 text-red-500 border border-red-200',
  'Ưu tiên':         'bg-orange-50 text-orange-500 border border-orange-200',
  'Ưu tiên thấp':    'bg-yellow-50 text-yellow-600 border border-yellow-200',
  'Bình thường':     'bg-gray-50 text-gray-400 border border-gray-200',
  'Đã xử lý':        'bg-emerald-50 text-emerald-600 border border-emerald-200',
  'Từ chối':         'bg-gray-50 text-gray-400 border border-gray-200 line-through',
}

function relativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Vừa xong'
  if (diffMin < 60) return `${diffMin} phút trước`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr} giờ trước`
  return `${Math.floor(diffHr / 24)} ngày trước`
}

function UrgencyDots({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5 items-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${i <= level ? 'bg-red-500' : 'bg-gray-200'}`}
        />
      ))}
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50">
      {[140, 80, 60, 90, 100].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div className={`h-3.5 bg-gray-200 rounded animate-pulse`} style={{ width: w }} />
        </td>
      ))}
    </tr>
  )
}

export default function AdminBloodCollect() {
  const [items, setItems] = useState<HospitalsTrafficItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [bloodTypeFilter, setBloodTypeFilter] = useState('')

  const LIMIT = 20

  useEffect(() => {
    setLoading(true)
    getHospitalsTraffic({ page, limit: LIMIT, search, status: statusFilter, bloodType: bloodTypeFilter })
      .then((res) => {
        setItems(res.data)
        setTotalPages(res.totalPages)
        setTotal(res.total)
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [page, search, statusFilter, bloodTypeFilter])

  // Đếm theo trạng thái để hiện summary
  const urgentCount = useMemo(() => items.filter(i => i.status  === 'Khẩn cấp' || i.status === 'Cực kỳ khẩn cấp').length, [items])
  const resolvedCount = useMemo(() => items.filter(i => i.status === 'Đã xử lý').length, [items])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleStatusChange = (v: string) => {
    setStatusFilter(v)
    setPage(1)
  }

  const handleBloodTypeChange = (v: string) => {
    setBloodTypeFilter(v)
    setPage(1)
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-dark mb-1">Quản lý lưu lượng máu</h1>
        <p className="text-gray-500 font-medium text-sm">Danh sách yêu cầu máu từ các bệnh viện</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm border-l-4 border-l-purple-500">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tổng yêu cầu</p>
          <p className="text-2xl font-extrabold text-purple-600">{total.toLocaleString('vi-VN')}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm border-l-4 border-l-red-500">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Khẩn cấp</p>
          <p className="text-2xl font-extrabold text-red-500">{urgentCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Đã xử lý</p>
          <p className="text-2xl font-extrabold text-emerald-600">{resolvedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ fontSize: 18 }} />
            <input
              type="text"
              placeholder="Tìm tên bệnh viện..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-400 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 transition-colors"
          >
            Tìm
          </button>
        </form>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 focus:outline-none focus:border-purple-400 bg-white"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Blood type filter */}
        <select
          value={bloodTypeFilter}
          onChange={(e) => handleBloodTypeChange(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 focus:outline-none focus:border-purple-400 bg-white"
        >
          <option value="">Nhóm máu</option>
          {BLOOD_TYPES.map((bt) => (
            <option key={bt} value={bt}>{bt}</option>
          ))}
        </select>

        {/* Clear filters */}
        {(search || statusFilter || bloodTypeFilter) && (
          <button
            onClick={() => { setSearch(''); setSearchInput(''); setStatusFilter(''); setBloodTypeFilter(''); setPage(1) }}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors font-semibold"
          >
            Xoá bộ lọc
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wide">Bệnh viện</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wide">Nhóm máu</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wide">Urgency</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wide">Trạng thái</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wide">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-gray-400 text-sm">
                    Không có dữ liệu phù hợp
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-dark">{item.hospitalName}</td>
                    <td className="px-4 py-3">
                      <span className="bg-red-50 text-primary px-2 py-0.5 rounded text-[10px] font-bold border border-red-100">
                        {item.bloodType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <UrgencyDots level={item.urgency} />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${STATUS_BADGE[item.status] ?? 'bg-gray-50 text-gray-400 border border-gray-200'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{relativeTime(item.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Trang {page} / {totalPages} · {total.toLocaleString('vi-VN')} yêu cầu
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Trước
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Tiếp →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
