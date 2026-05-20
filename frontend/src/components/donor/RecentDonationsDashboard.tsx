import CancelIcon from '@mui/icons-material/Cancel'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PendingIcon from '@mui/icons-material/Pending'
import { CircularProgress } from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FavoriteIcon from '@mui/icons-material/Favorite'
import {
  getDonorDonationHistory,
  type DonationHistoryForDonor,
  type DonationStatus,
} from '../../services/donationHistory.service'
import { useStore } from '../../store/useStore'

const STATUS_CONFIG: Record<DonationStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDING:  { label: 'Chờ duyệt', color: 'text-orange-600', bg: 'bg-orange-50',  icon: <PendingIcon sx={{ fontSize: 12 }} /> },
  ACCEPTED: { label: 'Đã duyệt',  color: 'text-green-600',  bg: 'bg-green-50',   icon: <CheckCircleIcon sx={{ fontSize: 12 }} /> },
  REJECTED: { label: 'Từ chối',   color: 'text-red-500',    bg: 'bg-red-50',     icon: <CancelIcon sx={{ fontSize: 12 }} /> },
}

export function RecentDonationsDashboard() {
  const navigate = useNavigate()
  const { user } = useStore()
  const [histories, setHistories] = useState<DonationHistoryForDonor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    getDonorDonationHistory(Number(user.id))
      .then((res) => setHistories(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user?.id])

  const recent = histories.slice(0, 3)

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-extrabold text-dark text-lg">Lịch sử hiến máu</h3>
        <button className="text-xs font-bold text-primary hover:underline" onClick={() => navigate('/donor/history')}>
          Xem tất cả
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <CircularProgress size={28} sx={{ color: '#EF4444' }} />
        </div>
      )}

      {!loading && recent.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-400 font-medium">Chưa có lịch sử hiến máu nào.</p>
        </div>
      )}

      {!loading && recent.length > 0 && (
        <div className="space-y-4">
          {recent.map(item => {
            const cfg = STATUS_CONFIG[item.status]
            return (
              <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-primary shrink-0">
                  <FavoriteIcon fontSize="small" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-dark">{item.hospital?.user?.name ?? 'Không rõ'}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(item.donationDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-dark text-sm">{item.unitBlood}ml</div>
                  <div className={`text-[10px] font-bold mt-0.5 px-2 py-0.5 rounded flex items-center justify-end gap-0.5 ${cfg.bg} ${cfg.color}`}>
                    {cfg.icon}
                    {cfg.label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
