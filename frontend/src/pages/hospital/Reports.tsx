import CancelIcon from '@mui/icons-material/Cancel'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloseIcon from '@mui/icons-material/Close'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BloodTypeChart } from '../../components/hospital/BloodTypeChart'
import { TrendChart } from '../../components/hospital/TrendChart'
import {
    getHospitalReports,
    getNotificationHistory,
    type HospitalReportStats,
    type NotificationHistoryItem,
} from '../../services/hospital.service'
import { useStore } from '../../store/useStore'

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
      <div className="h-8 bg-gray-200 rounded w-20 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-24" />
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-100 rounded w-full" />
        </td>
      ))}
    </tr>
  )
}

const BLOOD_TYPE_LABEL: Record<string, string> = {
  A_POSITIVE: 'A+', A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+', B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+', AB_NEGATIVE: 'AB-',
  O_POSITIVE: 'O+', O_NEGATIVE: 'O-',
}

const BLOOD_COLOR: Record<string, string> = {
  A_POSITIVE: 'bg-red-50 text-red-600 border-red-200',
  A_NEGATIVE: 'bg-red-50 text-red-600 border-red-200',
  B_POSITIVE: 'bg-blue-50 text-blue-600 border-blue-200',
  B_NEGATIVE: 'bg-blue-50 text-blue-600 border-blue-200',
  AB_POSITIVE: 'bg-purple-50 text-purple-600 border-purple-200',
  AB_NEGATIVE: 'bg-purple-50 text-purple-600 border-purple-200',
  O_POSITIVE: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  O_NEGATIVE: 'bg-emerald-50 text-emerald-600 border-emerald-200',
}

function DonorMiniCard({
  item,
  onClose,
  onViewDetail,
}: {
  item: NotificationHistoryItem
  onClose: () => void
  onViewDetail: (donorUserId: number) => void
}) {
  const donor = item.donor
  if (!donor) return null
  const genderLabel = donor.gender === 'MALE' ? 'Nam' : donor.gender === 'FEMALE' ? 'Nữ' : null
  const bloodLabel = donor.bloodType ? BLOOD_TYPE_LABEL[donor.bloodType] ?? donor.bloodType : null
  const bloodColor = donor.bloodType ? BLOOD_COLOR[donor.bloodType] ?? 'bg-gray-50 text-gray-500 border-gray-200' : ''

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

      {/* Card */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {donor.user.avatar ? (
              <img
                src={donor.user.avatar}
                alt={donor.user.name}
                className="w-12 h-12 rounded-xl object-cover border border-gray-200 flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-lg font-bold border border-red-200 flex-shrink-0">
                {donor.user.name?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
            <div>
              <p className="font-extrabold text-dark text-sm leading-tight">{donor.user.name}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Người hiến máu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {bloodLabel && (
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${bloodColor}`}>
                🩸 {bloodLabel}
              </span>
            )}
            {genderLabel && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                <PersonOutlinedIcon sx={{ fontSize: 13 }} /> {genderLabel}
              </span>
            )}
            {donor.age && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-200">
                {donor.age} tuổi
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-50" />

          {/* Request info */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 font-bold uppercase tracking-widest mb-1">Khoảng cách</p>
              <p className="font-extrabold text-dark">{item.distance.toFixed(1)} km</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 font-bold uppercase tracking-widest mb-1">Phản hồi</p>
              <p className="font-extrabold">
                {item.isAccept === null
                  ? <span className="text-yellow-500">Chờ phản hồi</span>
                  : item.isAccept
                  ? <span className="text-green-600">Đồng ý ✓</span>
                  : <span className="text-red-500">Từ chối ✗</span>}
              </p>
            </div>
          </div>

          {item.notes && (
            <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500">
              <p className="text-gray-400 font-bold uppercase tracking-widest mb-1">Ghi chú</p>
              <p className="italic">"{item.notes}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <button
            onClick={() => onViewDetail(donor.userId)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent text-white text-sm font-bold hover:opacity-90 transition-all"
          >
            <OpenInNewIcon sx={{ fontSize: 16 }} />
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ isAccept }: { isAccept: boolean | null }) {
  if (isAccept === null)
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-600 border border-yellow-200">
        <HelpOutlineIcon sx={{ fontSize: 12 }} /> Chờ
      </span>
    )
  if (isAccept)
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-success border border-green-200">
        <CheckCircleIcon sx={{ fontSize: 12 }} /> Đồng ý
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-primary border border-red-200">
      <CancelIcon sx={{ fontSize: 12 }} /> Từ chối
    </span>
  )
}

function UrgencyBadge({ level }: { level: number }) {
  const colors = [
    '', // 0 unused
    'bg-green-50 text-green-700 border-green-200',
    'bg-blue-50 text-blue-700 border-blue-200',
    'bg-yellow-50 text-yellow-700 border-yellow-200',
    'bg-orange-50 text-orange-700 border-orange-200',
    'bg-red-50 text-red-700 border-red-200',
  ]
  const labels = ['', 'Bình thường', 'Ưu tiên thấp', 'Ưu tiên', 'Khẩn cấp', 'Cực kỳ khẩn cấp']
  const cls = colors[level] ?? colors[3]
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {labels[level] ?? level}
    </span>
  )
}

type FilterType = 'all' | 'true' | 'false' | 'null'

const FILTER_TABS: { label: string; value: FilterType }[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Đồng ý', value: 'true' },
  { label: 'Từ chối', value: 'false' },
  { label: 'Chờ phản hồi', value: 'null' },
]

export function Reports() {
  const { user } = useStore()
  const navigate = useNavigate()

  // Overview Cards
  const [stats, setStats] = useState<HospitalReportStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState('')

  // Notification History
  const [history, setHistory] = useState<NotificationHistoryItem[]>([])
  const [historyMeta, setHistoryMeta] = useState({ total: 0, page: 1, totalPages: 1 })
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [page, setPage] = useState(1)
  const LIMIT = 10

  // Donor mini card
  const [selectedItem, setSelectedItem] = useState<NotificationHistoryItem | null>(null)

  useEffect(() => {
    if (!user?.id) return
    setStatsLoading(true)
    getHospitalReports(Number(user.id))
      .then((res) => setStats(res.data))
      .catch(() => setStatsError('Không thể tải dữ liệu tổng quan.'))
      .finally(() => setStatsLoading(false))
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return
    setHistoryLoading(true)
    const isAcceptParam = filter === 'all' ? undefined : (filter as 'true' | 'false' | 'null')
    getNotificationHistory(Number(user.id), page, LIMIT, isAcceptParam)
      .then((res) => {
        setHistory(res.data.items)
        setHistoryMeta({ total: res.data.total, page: res.data.page, totalPages: res.data.totalPages })
      })
      .catch(() => setHistoryError('Không thể tải lịch sử yêu cầu.'))
      .finally(() => setHistoryLoading(false))
  }, [user?.id, page, filter])

  const handleFilterChange = (val: FilterType) => {
    setFilter(val)
    setPage(1)
  }

  const cards = stats
    ? [
        { label: 'Tổng yêu cầu đã gửi', value: stats.totalRequests, sub: 'yêu cầu hiến máu', textColor: 'text-accent', bg: 'bg-blue-50' },
        { label: 'Tỉ lệ chấp nhận', value: `${stats.acceptRate}%`, sub: `${stats.acceptedRequests} / ${stats.totalRequests} yêu cầu`, textColor: 'text-success', bg: 'bg-green-50' },
        { label: 'Đang chờ phản hồi', value: stats.pendingRequests, sub: 'chưa có phản hồi', textColor: 'text-yellow-600', bg: 'bg-yellow-50' },
        { label: 'Tổng đơn vị máu nhận', value: stats.totalUnitBlood, sub: 'đơn vị (ca đã chấp nhận)', textColor: 'text-primary', bg: 'bg-red-50' },
      ]
    : []

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-3xl font-extrabold text-dark">Báo cáo</h1>
        </div>
        <p className="text-gray-500 text-sm font-medium">Tổng quan hoạt động kêu gọi hiến máu của bệnh viện</p>
      </div>

      {/* Stats error */}
      {statsError && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-6">{statsError}</div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : cards.map((card) => (
              <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{card.label}</p>
                <p className={`text-3xl font-extrabold ${card.textColor} mb-1`}>{card.value}</p>
                <p className="text-xs text-gray-400">{card.sub}</p>
              </div>
            ))}
      </div>

      {/* Charts: 2 cột */}
      {user?.id && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          <div className="lg:col-span-7">
            <TrendChart userId={Number(user.id)} />
          </div>
          <div className="lg:col-span-5">
            <BloodTypeChart userId={Number(user.id)} />
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-bold text-dark text-base">Lịch sử yêu cầu</h2>
          {/* Filter tabs */}
          <div className="flex gap-1 flex-wrap">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleFilterChange(tab.value)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  filter === tab.value
                    ? 'bg-accent text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* History error */}
        {historyError && (
          <div className="px-5 py-3 text-sm text-red-600 bg-red-50">{historyError}</div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-widest">
                <th className="px-4 py-3 text-left font-semibold">#</th>
                <th className="px-4 py-3 text-left font-semibold">Thời gian</th>
                <th className="px-4 py-3 text-left font-semibold">Mức khẩn</th>
                <th className="px-4 py-3 text-left font-semibold">Khoảng cách</th>
                <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                <th className="px-4 py-3 text-left font-semibold">Người hiến</th>
                <th className="px-4 py-3 text-left font-semibold">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {historyLoading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400 text-sm">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                history.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => item.donor && setSelectedItem(item)}
                  >
                    <td className="px-4 py-3 text-gray-400 font-medium">
                      {(historyMeta.page - 1) * LIMIT + idx + 1}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-3"><UrgencyBadge level={item.urgency} /></td>
                    <td className="px-4 py-3 text-gray-600">{item.distance.toFixed(1)} km</td>
                    <td className="px-4 py-3"><StatusBadge isAccept={item.isAccept} /></td>
                    <td className="px-4 py-3">
                      {item.donor ? (
                        <div className="flex items-center gap-2">
                          {item.donor.user.avatar ? (
                            <img
                              src={item.donor.user.avatar}
                              alt={item.donor.user.name}
                              className="w-7 h-7 rounded-full object-cover border border-gray-200 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold border border-red-200 flex-shrink-0">
                              {item.donor.user.name?.[0]?.toUpperCase() ?? '?'}
                            </div>
                          )}
                          <span className="text-xs font-semibold text-gray-700 truncate max-w-[120px]">
                            {item.donor.user.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">{item.notes ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!historyLoading && historyMeta.totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-400">
              Trang {historyMeta.page} / {historyMeta.totalPages} &nbsp;·&nbsp; {historyMeta.total} bản ghi
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <NavigateBeforeIcon sx={{ fontSize: 16 }} /> Trước
              </button>
              <button
                disabled={page >= historyMeta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Sau <NavigateNextIcon sx={{ fontSize: 16 }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Donor mini card modal */}
      {selectedItem && selectedItem.donor && (
        <DonorMiniCard
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onViewDetail={(donorUserId) => {
            setSelectedItem(null)
            navigate(`/hospital/donors/${donorUserId}`)
          }}
        />
      )}
    </div>
  )
}
