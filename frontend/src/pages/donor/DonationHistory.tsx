import CancelIcon from '@mui/icons-material/Cancel'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HistoryIcon from '@mui/icons-material/History'
import OpacityIcon from '@mui/icons-material/Opacity'
import PendingIcon from '@mui/icons-material/Pending'
import { Chip, CircularProgress } from '@mui/material'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
  getDonorDonationHistory,
  type DonationHistoryForDonor,
  type DonationStatus,
} from '../../services/donationHistory.service'
import { useStore } from '../../store/useStore'

type FilterType = 'ALL' | DonationStatus

const STATUS_CONFIG: Record<DonationStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDING: {
    label: 'Chờ duyệt',
    color: 'text-orange-600',
    bg: 'bg-orange-50 border-orange-100',
    icon: <PendingIcon sx={{ fontSize: 14 }} />,
  },
  ACCEPTED: {
    label: 'Đã duyệt',
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-100',
    icon: <CheckCircleIcon sx={{ fontSize: 14 }} />,
  },
  REJECTED: {
    label: 'Từ chối',
    color: 'text-red-500',
    bg: 'bg-red-50 border-red-100',
    icon: <CancelIcon sx={{ fontSize: 14 }} />,
  },
}

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ duyệt' },
  { key: 'ACCEPTED', label: 'Đã duyệt' },
  { key: 'REJECTED', label: 'Từ chối' },
]

export default function DonationHistory() {
  const { user } = useStore()
  const [histories, setHistories] = useState<DonationHistoryForDonor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<FilterType>('ALL')

  useEffect(() => {
    if (!user?.id) return
    setLoading(true)
    getDonorDonationHistory(Number(user.id))
      .then((res) => setHistories(res.data ?? []))
      .catch(() => setError('Không thể tải dữ liệu. Vui lòng thử lại.'))
      .finally(() => setLoading(false))
  }, [user?.id])

  const filtered = filter === 'ALL' ? histories : histories.filter((h) => h.status === filter)

  const stats = {
    total: histories.length,
    pending: histories.filter((h) => h.status === 'PENDING').length,
    approved: histories.filter((h) => h.status === 'ACCEPTED').length,
    rejected: histories.filter((h) => h.status === 'REJECTED').length,
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-dark mb-1">Lịch sử hiến máu</h1>
          <p className="text-gray-500 font-medium text-sm">
            {user?.name} — Toàn bộ lịch sử hiến máu của bạn
          </p>
        </div>
      </div>

      {/* Stats Mini */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng cộng', value: stats.total, color: 'text-dark', bg: 'bg-white', border: 'border-white' },
          { label: 'Chờ duyệt', value: stats.pending, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
          { label: 'Đã duyệt', value: stats.approved, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
          { label: 'Từ chối', value: stats.rejected, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4 flex items-center justify-between shadow-sm`}>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`text-2xl font-extrabold ${s.color}`}>{loading ? '—' : s.value}</p>
            </div>
            <OpacityIcon className={`${s.color} opacity-30`} sx={{ fontSize: 32 }} />
          </div>
        ))}
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filter Tabs */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center gap-2 flex-wrap">
          {FILTERS.map((f) => {
            const isActive = filter === f.key
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  isActive
                    ? 'bg-accent text-white border-accent shadow-sm'
                    : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-200 hover:bg-gray-100'
                }`}
              >
                {f.label}
                {f.key !== 'ALL' && (
                  <span className={`ml-1.5 ${isActive ? 'opacity-80' : 'opacity-60'}`}>
                    ({f.key === 'PENDING' ? stats.pending : f.key === 'ACCEPTED' ? stats.approved : stats.rejected})
                  </span>
                )}
              </button>
            )
          })}
          <div className="ml-auto">
            <Chip
              label={`${filtered.length} kết quả`}
              size="small"
              sx={{ bgcolor: '#eff6ff', color: '#3b82f6', fontWeight: 800, borderRadius: 2 }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 min-h-64">
          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <CircularProgress size={48} sx={{ color: '#3B82F6' }} thickness={4} />
              <p className="text-sm text-gray-500 font-medium">Đang tải dữ liệu...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-3 border-4 border-white shadow-sm">
                <CancelIcon sx={{ fontSize: 32, color: '#ef4444' }} />
              </div>
              <p className="text-sm font-bold text-dark mb-1">Có lỗi xảy ra</p>
              <p className="text-xs text-gray-500">{error}</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3 border-4 border-white shadow-sm">
                <HistoryIcon sx={{ fontSize: 32, color: '#3b82f6' }} />
              </div>
              <p className="text-sm font-bold text-dark mb-1">Chưa có lịch sử nào</p>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                {filter === 'ALL'
                  ? 'Bạn chưa có lịch sử hiến máu nào được ghi nhận.'
                  : `Không có lịch sử ở trạng thái "${FILTERS.find((f) => f.key === filter)?.label}".`}
              </p>
            </div>
          )}

          {/* List */}
          {!loading && !error && filtered.length > 0 && (
            <div className="flex flex-col gap-3">
              <AnimatePresence>
                {filtered.map((history, index) => {
                  const cfg = STATUS_CONFIG[history.status]

                  return (
                    <motion.div
                      key={history.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ delay: index * 0.04 }}
                      className={`rounded-2xl p-4 border flex items-center gap-4 transition-all ${
                        history.status === 'ACCEPTED'
                          ? 'bg-green-50/40 border-green-100'
                          : history.status === 'REJECTED'
                          ? 'bg-red-50/20 border-red-100'
                          : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
                      }`}
                    >
                      {/* Index */}
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-accent flex items-center justify-center text-sm font-extrabold shrink-0">
                        #{index + 1}
                      </div>

                      {/* Info */}
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="text-sm font-extrabold text-dark truncate">
                            {history.hospital?.user?.name ?? 'Không rõ bệnh viện'}
                          </h4>
                          <span className="bg-red-50 border border-red-100 text-primary text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
                            🩸 {history.bloodType ?? '—'}
                          </span>
                          <span className="bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
                            {history.unitBlood ?? '—'}ml đơn vị
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">
                          Ngày hiến:{' '}
                          {new Date(history.donationDate).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-bold shrink-0 ${cfg.bg} ${cfg.color}`}>
                        {cfg.icon}
                        {cfg.label}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
