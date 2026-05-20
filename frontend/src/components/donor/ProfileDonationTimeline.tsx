import CancelIcon from '@mui/icons-material/Cancel'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PendingIcon from '@mui/icons-material/Pending'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { paths } from '../../routes/paths'
import {
    getDonorDonationHistory,
    type DonationHistoryForDonor,
    type DonationStatus,
} from '../../services/donationHistory.service'
import { useStore } from '../../store/useStore'

const STATUS_CONFIG: Record<DonationStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDING:  { label: 'Chờ duyệt', color: 'text-orange-600', bg: 'bg-orange-50',  icon: <PendingIcon sx={{ fontSize: 11 }} /> },
  ACCEPTED: { label: 'Đã duyệt',  color: 'text-green-600',  bg: 'bg-green-50',   icon: <CheckCircleIcon sx={{ fontSize: 11 }} /> },
  REJECTED: { label: 'Từ chối',   color: 'text-red-500',    bg: 'bg-red-50',     icon: <CancelIcon sx={{ fontSize: 11 }} /> },
}

const formatDate = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return parsed.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function ProfileDonationTimeline() {
  const navigate = useNavigate()
  const { user } = useStore()
  const [histories, setHistories] = useState<DonationHistoryForDonor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    getDonorDonationHistory(Number(user.id))
      .then((res) => setHistories((res.data ?? []).slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user?.id])

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h3 className="text-lg font-extrabold text-dark">Mini timeline hiến máu</h3>
        <button
          type="button"
          onClick={() => navigate(paths.donor.history)}
          className="text-xs font-bold text-primary transition hover:underline"
        >
          Xem tất cả
        </button>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-start gap-3">
              <div className="mt-1 h-3 w-3 animate-pulse rounded-full bg-gray-200" />
              <div className="w-full space-y-2">
                <div className="h-4 w-36 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-56 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && histories.length === 0 && (
        <p className="text-sm text-gray-400">Chưa có lịch sử hiến máu nào.</p>
      )}

      {/* Timeline list */}
      {!loading && histories.length > 0 && (
        <div className="space-y-4">
          {histories.map((item, index) => {
            const cfg = STATUS_CONFIG[item.status]
            return (
              <div key={item.id} className="flex items-start gap-3">
                <div className="mt-1.5 flex flex-col items-center">
                  <span className="h-3 w-3 rounded-full bg-primary" />
                  {index < histories.length - 1 ? <span className="mt-1 h-12 w-px bg-gray-200" /> : null}
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50/60 px-4 py-3">
                  <p className="text-sm font-bold text-dark">{formatDate(item.donationDate)}</p>
                  <p className="mt-1 text-xs text-gray-500">{item.hospital?.user?.name ?? 'Không rõ bệnh viện'}</p>
                  <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${cfg.bg} ${cfg.color}`}>
                    {cfg.icon}
                    {cfg.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
