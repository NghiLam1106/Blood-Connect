import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import SearchIcon from '@mui/icons-material/Search'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { HospitalItem } from '../../services/admin.service'
import { getHospitals, verifyHospital } from '../../services/admin.service'

const VERIFY_OPTIONS = [
  { label: 'Tất cả', value: '' },
  { label: 'Đã xác minh', value: 'true' },
  { label: 'Chờ duyệt', value: 'false' },
]

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50">
      {[180, 160, 90, 80, 80].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3.5 bg-gray-200 rounded animate-pulse" style={{ width: w }} />
        </td>
      ))}
    </tr>
  )
}

export default function AdminHospitals() {
  const navigate = useNavigate()
  const [items, setItems] = useState<HospitalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [verifyFilter, setVerifyFilter] = useState('')

  const [pendingId, setPendingId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const LIMIT = 20

  const fetchData = () => {
    setLoading(true)
    const isVerified =
      verifyFilter === 'true' ? true : verifyFilter === 'false' ? false : undefined
    getHospitals({ page, limit: LIMIT, search: search || undefined, isVerified })
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
  }, [page, search, verifyFilter])

  const verifiedCount = useMemo(() => items.filter((i) => i.isVerified).length, [items])
  const pendingCount = useMemo(() => items.filter((i) => !i.isVerified).length, [items])

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleVerify = async (e: React.MouseEvent, userId: number, newValue: boolean) => {
    e.stopPropagation()
    setPendingId(userId)
    try {
      await verifyHospital(userId, newValue)
      setItems((prev) =>
        prev.map((item) =>
          item.userId === userId ? { ...item, isVerified: newValue } : item
        )
      )
      showToast(
        newValue ? 'Đã xác minh bệnh viện thành công!' : 'Đã thu hồi xác minh bệnh viện!',
        'success'
      )
    } catch {
      showToast('Có lỗi xảy ra, vui lòng thử lại!', 'error')
    } finally {
      setPendingId(null)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleVerifyFilter = (v: string) => {
    setVerifyFilter(v)
    setPage(1)
  }

  const clearFilters = () => {
    setSearch('')
    setSearchInput('')
    setVerifyFilter('')
    setPage(1)
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-dark mb-1">Quản lý Bệnh viện</h1>
        <p className="text-gray-500 font-medium text-sm">
          Duyệt và quản lý trạng thái xác minh các bệnh viện trong hệ thống
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm border-l-4 border-l-purple-500">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tổng bệnh viện</p>
          <p className="text-2xl font-extrabold text-purple-600">{total.toLocaleString('vi-VN')}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Đã xác minh</p>
          <p className="text-2xl font-extrabold text-emerald-600">{verifiedCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm border-l-4 border-l-amber-400">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Chờ duyệt</p>
          <p className="text-2xl font-extrabold text-amber-500">{pendingCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ fontSize: 18 }} />
            <input
              type="text"
              placeholder="Tìm tên hoặc email bệnh viện..."
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

        <select
          value={verifyFilter}
          onChange={(e) => handleVerifyFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 focus:outline-none focus:border-purple-400 bg-white"
        >
          {VERIFY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {(search || verifyFilter) && (
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
                <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wide">Bệnh viện</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wide">Ngày đăng ký</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wide">Trạng thái</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wide">Hành động</th>
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
                  <tr
                    key={item.userId}
                    onClick={() => navigate(`/admin/hospitals/${item.userId}`)}
                    className="border-b border-gray-50 hover:bg-purple-50/40 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 font-semibold text-dark">{item.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{item.email}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-3">
                      {item.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200">
                          <CheckCircleOutlineIcon style={{ fontSize: 12 }} />
                          Đã xác minh
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-500 border border-amber-200">
                          <RemoveCircleOutlineIcon style={{ fontSize: 12 }} />
                          Chờ duyệt
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {item.isVerified ? (
                        <button
                          onClick={(e) => handleVerify(e, item.userId, false)}
                          disabled={pendingId === item.userId}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {pendingId === item.userId ? '...' : 'Thu hồi'}
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleVerify(e, item.userId, true)}
                          disabled={pendingId === item.userId}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {pendingId === item.userId ? '...' : 'Duyệt'}
                        </button>
                      )}
                    </td>
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
              Trang {page} / {totalPages} · {total.toLocaleString('vi-VN')} bệnh viện
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
