import SearchIcon from '@mui/icons-material/Search'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { DonorItem } from '../../services/admin.service'
import { getDonors } from '../../services/admin.service'

const BLOOD_TYPE_OPTIONS = [
  { label: 'Tất cả nhóm máu', value: '' },
  { label: 'A+', value: 'A+' },
  { label: 'A-', value: 'A-' },
  { label: 'B+', value: 'B+' },
  { label: 'B-', value: 'B-' },
  { label: 'AB+', value: 'AB+' },
  { label: 'AB-', value: 'AB-' },
  { label: 'O+', value: 'O+' },
  { label: 'O-', value: 'O-' },
]

const STATUS_OPTIONS = [
  { label: 'Tất cả trạng thái', value: '' },
  { label: 'Sẵn sàng', value: 'AVAILABLE' },
  { label: 'Không sẵn sàng', value: 'UNAVAILABLE' },
]

const BLOOD_TYPE_LABEL: Record<string, string> = {
  'A+': 'A+', 'A-': 'A-',
  'B+': 'B+', 'B-': 'B-',
  'AB+': 'AB+', 'AB-': 'AB-',
  'O+': 'O+', 'O-': 'O-',
}

const BLOOD_TYPE_COLOR: Record<string, string> = {
  'A+': 'bg-red-50 text-red-600 border-red-200',
  'A-': 'bg-red-50 text-red-600 border-red-200',
  'B+': 'bg-red-50 text-red-600 border-red-200',
  'B-': 'bg-red-50 text-red-600 border-red-200',
  'AB+': 'bg-red-50 text-red-600 border-red-200',
  'AB-': 'bg-red-50 text-red-600 border-red-200',
  'O+': 'bg-red-50 text-red-600 border-red-200',
  'O-': 'bg-red-50 text-red-600 border-red-200',
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatRate(rate: number | null): string {
  if (rate === null || rate === undefined) return '—'
  return `${Math.round(rate * 100)}%`
}

function AvatarCell({ name, avatar }: { name: string; avatar: string | null }) {
  if (avatar) {
    return (
      <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
        <img
          src={avatar}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }
  return (
    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold uppercase border border-red-200">
      {name?.[0] ?? '?'}
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50">
      {[36, 160, 140, 70, 80, 60, 70, 90].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3.5 bg-gray-200 rounded animate-pulse" style={{ width: w }} />
        </td>
      ))}
    </tr>
  )
}

export default function AdminDonors() {
  const navigate = useNavigate()
  const [items, setItems] = useState<DonorItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [bloodTypeFilter, setBloodTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const LIMIT = 20

  const fetchData = () => {
    setLoading(true)
    getDonors({
      page,
      limit: LIMIT,
      search: search || undefined,
      bloodType: bloodTypeFilter || undefined,
      status: statusFilter || undefined,
    })
      .then((res) => {
        setItems(res.data)
        setTotalPages(res.totalPages)
        setTotal(res.total)
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, bloodTypeFilter, statusFilter])

  const availableCount = useMemo(() => items.filter((i) => i.status === 'AVAILABLE').length, [items])
  const unavailableCount = useMemo(() => items.filter((i) => i.status === 'UNAVAILABLE').length, [items])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleBloodTypeFilter = (v: string) => {
    setBloodTypeFilter(v)
    setPage(1)
  }

  const handleStatusFilter = (v: string) => {
    setStatusFilter(v)
    setPage(1)
  }

  const clearFilters = () => {
    setSearch('')
    setSearchInput('')
    setBloodTypeFilter('')
    setStatusFilter('')
    setPage(1)
  }

  const hasFilter = search || bloodTypeFilter || statusFilter

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-dark mb-1">Quản lý Donor</h1>
        <p className="text-gray-500 font-medium text-sm">
          Xem và quản lý danh sách người hiến máu trong hệ thống
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm border-l-4 border-l-red-500">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tổng donor</p>
          <p className="text-2xl font-extrabold text-red-600">{total.toLocaleString('vi-VN')}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Sẵn sàng</p>
          <p className="text-2xl font-extrabold text-emerald-600">{availableCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm border-l-4 border-l-gray-400">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Không sẵn sàng</p>
          <p className="text-2xl font-extrabold text-gray-500">{unavailableCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ fontSize: 18 }} />
            <input
              type="text"
              placeholder="Tìm tên, email, hoặc SĐT..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-red-400 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors"
          >
            Tìm
          </button>
        </form>

        <select
          value={bloodTypeFilter}
          onChange={(e) => handleBloodTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 focus:outline-none focus:border-red-400 bg-white"
        >
          {BLOOD_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 focus:outline-none focus:border-red-400 bg-white"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {hasFilter && (
          <button
            onClick={clearFilters}
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
                <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wide w-10"></th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wide">Tên</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wide">Nhóm máu</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wide">Trạng thái</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wide">Lần hiến</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wide">Tỉ lệ</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wide">Ngày đăng ký</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-gray-400 text-sm">
                    Không có dữ liệu phù hợp
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.userId}
                    onClick={() => navigate(`/admin/donors/${item.userId}`)}
                    className="border-b border-gray-50 hover:bg-red-50/30 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <AvatarCell name={item.name} avatar={item.avatar} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-dark text-sm">{item.name}</p>
                      {item.phone && (
                        <p className="text-xs text-gray-400 mt-0.5">{item.phone}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{item.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded border ${BLOOD_TYPE_COLOR[item.bloodType] ?? 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                        {BLOOD_TYPE_LABEL[item.bloodType] ?? item.bloodType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.status === 'AVAILABLE' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                          Sẵn sàng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-gray-50 text-gray-400 border border-gray-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
                          Không sẵn sàng
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-dark">{item.totalDonations}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatRate(item.responseRate)}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDate(item.createdAt)}</td>
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
              Trang {page} / {totalPages} · {total.toLocaleString('vi-VN')} donor
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
