import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CancelIcon from '@mui/icons-material/Cancel'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined'
import HistoryIcon from '@mui/icons-material/History'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import OpacityIcon from '@mui/icons-material/Opacity'
import PendingIcon from '@mui/icons-material/Pending'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import ScaleOutlinedIcon from '@mui/icons-material/ScaleOutlined'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { DonorDetailResponse, DonorHistory } from '../../services/admin.service'
import { getDonorDetail } from '../../services/admin.service'
import { useStore } from '../../store/useStore'

const BLOOD_TYPE_LABEL: Record<string, string> = {
  A_POSITIVE: 'A+', A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+', B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+', AB_NEGATIVE: 'AB-',
  O_POSITIVE: 'O+', O_NEGATIVE: 'O-',
}

const BLOOD_TYPE_COLOR: Record<string, string> = {
  A_POSITIVE: 'bg-red-50 text-red-600 border-red-200',
  A_NEGATIVE: 'bg-red-50 text-red-600 border-red-200',
  B_POSITIVE: 'bg-blue-50 text-blue-600 border-blue-200',
  B_NEGATIVE: 'bg-blue-50 text-blue-600 border-blue-200',
  AB_POSITIVE: 'bg-purple-50 text-purple-600 border-purple-200',
  AB_NEGATIVE: 'bg-purple-50 text-purple-600 border-purple-200',
  O_POSITIVE: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  O_NEGATIVE: 'bg-emerald-50 text-emerald-600 border-emerald-200',
}

const STATUS_CONFIG = {
  PENDING: { label: 'Chờ duyệt', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100', icon: <PendingIcon sx={{ fontSize: 13 }} /> },
  ACCEPTED: { label: 'Đã duyệt', color: 'text-green-600', bg: 'bg-green-50 border-green-100', icon: <CheckCircleIcon sx={{ fontSize: 13 }} /> },
  REJECTED: { label: 'Từ chối', color: 'text-red-500', bg: 'bg-red-50 border-red-100', icon: <CancelIcon sx={{ fontSize: 13 }} /> },
}

type FilterTab = 'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'ACCEPTED', label: 'Đã duyệt' },
  { key: 'PENDING', label: 'Chờ duyệt' },
  { key: 'REJECTED', label: 'Từ chối' },
]

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <span className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div className="flex-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-dark">
          {value ?? <span className="text-gray-300 italic font-normal">Chưa có</span>}
        </p>
      </div>
    </div>
  )
}

function HistoryItem({ history, index }: { history: DonorHistory; index: number }) {
  const cfg = STATUS_CONFIG[history.status]
  return (
    <div className={`rounded-2xl p-4 border flex items-center gap-4 ${
      history.status === 'ACCEPTED' ? 'bg-green-50/40 border-green-100'
      : history.status === 'REJECTED' ? 'bg-red-50/20 border-red-100'
      : 'bg-white border-gray-100'
    }`}>
      <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center text-xs font-extrabold shrink-0">
        #{index + 1}
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h4 className="text-sm font-extrabold text-dark truncate">{history.hospitalName}</h4>
          <span className="bg-red-50 border border-red-100 text-red-500 text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
            🩸 {BLOOD_TYPE_LABEL[history.bloodType] ?? history.bloodType}
          </span>
          <span className="bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
            {history.unitBlood}ml
          </span>
        </div>
        <p className="text-xs text-gray-500 font-medium">
          Ngày hiến: {formatDate(history.donationDate)}
        </p>
        {history.notes && (
          <p className="text-xs text-gray-400 mt-0.5 italic">"{history.notes}"</p>
        )}
      </div>
      <div className={`flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-bold shrink-0 ${cfg.bg} ${cfg.color}`}>
        {cfg.icon}
        {cfg.label}
      </div>
    </div>
  )
}

export default function HospitalDonorDetail() {
  const { donorUserId } = useParams<{ donorUserId: string }>()
  const navigate = useNavigate()
  const { user } = useStore()

  const [data, setData] = useState<DonorDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [historyFilter, setHistoryFilter] = useState<FilterTab>('ALL')

  useEffect(() => {
    if (!donorUserId) return
    setLoading(true)
    getDonorDetail(Number(donorUserId))
      .then((res) => {
        if (!res) setNotFound(true)
        else setData(res)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [donorUserId])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-8 w-24 bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div className="animate-pulse space-y-4">
          <div className="bg-white rounded-2xl p-6 space-y-4 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded-lg w-40" />
                <div className="h-3 bg-gray-100 rounded-lg w-24" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-xl" />)}
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !data) {
    return (
      <div className="max-w-3xl mx-auto text-center py-24">
        <FavoriteOutlinedIcon style={{ fontSize: 48 }} className="text-gray-300 mb-4" />
        <p className="text-gray-400 font-semibold text-lg">Không tìm thấy người hiến máu</p>
        <button
          onClick={() => navigate('/hospital/matching')}
          className="mt-6 px-5 py-2 bg-accent text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all"
        >
          Quay lại danh sách
        </button>
      </div>
    )
  }

  const { donor, histories } = data

  // Lọc chỉ lịch sử hiến tại bệnh viện này
  // histories từ admin API có hospitalName, nhưng cần so sánh với tên bệnh viện hiện tại
  // Dùng user.name (tên bệnh viện đang đăng nhập) để lọc
  const myHospitalName = user?.name ?? ''
  const myHistories = myHospitalName
    ? histories.filter((h) => h.hospitalName === myHospitalName)
    : histories

  const filteredHistories = historyFilter === 'ALL'
    ? myHistories
    : myHistories.filter((h) => h.status === historyFilter)

  const acceptedCount = myHistories.filter((h) => h.status === 'ACCEPTED').length
  const pendingCount = myHistories.filter((h) => h.status === 'PENDING').length
  const rejectedCount = myHistories.filter((h) => h.status === 'REJECTED').length
  const lastDonationAtMyHospital = myHistories.find((h) => h.status === 'ACCEPTED')?.donationDate ?? null

  const genderLabel = (g: string | null | undefined) => {
    if (g === 'MALE') return 'Nam'
    if (g === 'FEMALE') return 'Nữ'
    return null
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate('/hospital/matching')}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-accent font-semibold mb-6 transition-colors"
      >
        <ArrowBackIcon style={{ fontSize: 18 }} />
        Quay lại danh sách người hiến máu
      </button>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <div className="flex items-center gap-4">
          {donor.avatar ? (
            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-200 flex-shrink-0">
              <img src={donor.avatar} alt={donor.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-2xl font-bold border border-red-200 flex-shrink-0">
              {donor.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-dark leading-tight">{donor.name}</h1>
            <p className="text-xs text-gray-400 mt-0.5">Người hiến máu</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {donor.bloodType && (
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${BLOOD_TYPE_COLOR[donor.bloodType] ?? 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                  🩸 {BLOOD_TYPE_LABEL[donor.bloodType] ?? donor.bloodType}
                </span>
              )}
              {donor.status === 'AVAILABLE' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  Sẵn sàng hiến
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gray-50 text-gray-400 border border-gray-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
                  Không sẵn sàng
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats tại bệnh viện này */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm border-l-4 border-l-red-500 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Hiến tại đây</p>
          <p className="text-2xl font-extrabold text-red-600">{acceptedCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm border-l-4 border-l-orange-400 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Chờ duyệt</p>
          <p className="text-2xl font-extrabold text-orange-500">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm border-l-4 border-l-emerald-500 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Hiến gần nhất</p>
          <p className="text-sm font-extrabold text-emerald-600">{formatDate(lastDonationAtMyHospital)}</p>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Thông tin cá nhân</h2>
        <InfoRow icon={<EmailOutlinedIcon style={{ fontSize: 18 }} />} label="Email" value={donor.email} />
        <InfoRow icon={<PhoneOutlinedIcon style={{ fontSize: 18 }} />} label="Số điện thoại" value={donor.phone} />
        <InfoRow icon={<LocationOnOutlinedIcon style={{ fontSize: 18 }} />} label="Địa chỉ" value={donor.address} />
        <InfoRow icon={<PersonOutlinedIcon style={{ fontSize: 18 }} />} label="Ngày sinh" value={formatDate((donor as any).dob)} />
        <InfoRow icon={<PersonOutlinedIcon style={{ fontSize: 18 }} />} label="Giới tính" value={genderLabel((donor as any).gender)} />
        <InfoRow icon={<ScaleOutlinedIcon style={{ fontSize: 18 }} />} label="Cân nặng" value={(donor as any).weight ? `${(donor as any).weight} kg` : null} />
        <InfoRow icon={<OpacityIcon style={{ fontSize: 18 }} />} label="Đơn vị máu / lần hiến" value={(donor as any).unitBlood ? `${(donor as any).unitBlood} ml` : null} />
      </div>

      {/* Lịch sử hiến tại bệnh viện này */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <HistoryIcon style={{ fontSize: 18 }} className="text-gray-400" />
            <h2 className="text-sm font-bold text-dark">Lịch sử hiến tại cơ sở</h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
              {myHistories.length} lần
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {FILTER_TABS.map((tab) => {
              const count = tab.key === 'ACCEPTED' ? acceptedCount
                : tab.key === 'PENDING' ? pendingCount
                : tab.key === 'REJECTED' ? rejectedCount
                : myHistories.length
              return (
                <button
                  key={tab.key}
                  onClick={() => setHistoryFilter(tab.key)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                    historyFilter === tab.key
                      ? 'bg-accent text-white border-accent shadow-sm'
                      : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {tab.label}
                  {tab.key !== 'ALL' && <span className="ml-1 opacity-70">({count})</span>}
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-4">
          {filteredHistories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-3 border-4 border-white shadow-sm">
                <HistoryIcon style={{ fontSize: 28 }} className="text-gray-300" />
              </div>
              <p className="text-sm font-bold text-dark mb-1">Chưa có lịch sử</p>
              <p className="text-xs text-gray-400">
                {historyFilter === 'ALL'
                  ? 'Người hiến này chưa có lịch sử hiến tại cơ sở của bạn.'
                  : `Không có lịch sử ở trạng thái "${FILTER_TABS.find((t) => t.key === historyFilter)?.label}".`}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredHistories.map((h, idx) => (
                <HistoryItem key={h.id} history={h} index={idx} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
