import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import FavoriteIcon from '@mui/icons-material/Favorite'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import SearchIcon from '@mui/icons-material/Search'
import {
  Avatar,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Typography
} from '@mui/material'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useState } from 'react'
import { useSocket } from '../../hooks/useSocket'
import { selectDonor } from '../../services/hospital.service'
import type { MatchedDonor } from '../../store/useStore'
import { useStore } from '../../store/useStore'
import { StatusBadge } from './StatusBadge'

interface MatchingResultsProps {
  searchDone: boolean
  matchedDonors: MatchedDonor[]
  isPending: boolean
  isSearching: boolean
  urgency: number
  notes: string
  hospitalUserId: number
}

export function MatchingResults({
  searchDone,
  matchedDonors,
  isPending,
  isSearching,
  urgency,
  notes,
  hospitalUserId,
}: MatchingResultsProps) {
  const { updateDonorStatus } = useStore()
  const [loadingDonorId, setLoadingDonorId] = useState<number | null>(null)
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Lắng nghe phản hồi donor real-time và hiển thị toast
  useSocket('donor-response', useCallback((data: { action: 'accept' | 'reject'; donorName: string }) => {
    const msg = data.action === 'accept'
      ? `✅ ${data.donorName} đã chấp nhận yêu cầu!`
      : `❌ ${data.donorName} đã từ chối yêu cầu.`
    showToast(msg, data.action === 'accept' ? 'success' : 'error')
  }, []))

  const handleSelectDonor = async (donor: MatchedDonor) => {
    if (loadingDonorId !== null) return
    setLoadingDonorId(donor.id)
    try {
      await selectDonor(hospitalUserId, {
        donorUserId: donor.userId,
        distance: donor.distance,
        urgency,
        notes,
      })
      updateDonorStatus(donor.id, 'confirmed')
      showToast(`Đã gửi thông báo đến ${donor.name} thành công!`, 'success')
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể gửi thông báo. Vui lòng thử lại.'
      showToast(msg, 'error')
    } finally {
      setLoadingDonorId(null)
    }
  }

  return (
    <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #EFF6FF', boxShadow: '0 4px 20px -4px rgba(59,130,246,0.05)', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Toast notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute top-3 right-3 z-50 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg flex items-center gap-2 max-w-xs ${
              toastMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {toastMessage.type === 'success' ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : '⚠️'}
            {toastMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      <CardContent sx={{ p: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10 rounded-t-4xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent text-white rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-xl">🤖</span>
            </div>
            <Typography variant="h6" fontWeight={800} className="text-dark">
              Danh sách Người hiến phù hợp
            </Typography>
          </div>
          {searchDone && (
            <Chip
              label={`${matchedDonors.length} Matches`}
              size="small"
              sx={{ bgcolor: '#eff6ff', color: '#3b82f6', fontWeight: 800, borderRadius: 2 }}
            />
          )}
        </div>

        {/* Stats summary after search */}
        {searchDone && matchedDonors.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Đã chọn', value: matchedDonors.filter(d => d.status === 'confirmed').length, color: 'text-accent', bg: 'bg-white', border: 'border-blue-100' },
                { label: 'Chờ phản hồi', value: matchedDonors.filter(d => d.status === 'pending').length, color: 'text-secondary', bg: 'bg-white', border: 'border-orange-100' },
                { label: 'Tổng tìm thấy', value: matchedDonors.length, color: 'text-dark', bg: 'bg-white', border: 'border-gray-100' },
              ].map((stat) => (
                <div key={stat.label} className={`${stat.bg} border ${stat.border} rounded-2xl p-3 text-center shadow-sm`}>
                  <div className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Searching state */}
        {(isPending || isSearching) && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
              <CircularProgress size={64} sx={{ color: '#3B82F6' }} thickness={4} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl animate-pulse">🤖</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-base text-dark font-extrabold mb-1">AI đang phân tích và xếp hạng người hiến...</p>
              <p className="text-xs text-gray-500 font-medium">Đang đối chiếu nhóm máu, khoảng cách và lịch sử hiến.</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isPending && !isSearching && !searchDone && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm">
              <SearchIcon sx={{ fontSize: 40, color: '#3b82f6' }} />
            </div>
            <h3 className="text-dark font-extrabold text-lg mb-2">Chưa có kết quả</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">Vui lòng thiết lập thông số yêu cầu & kích hoạt AI Matching để tìm người hiến phù hợp.</p>
          </div>
        )}

        {/* No results found */}
        {!isPending && !isSearching && searchDone && matchedDonors.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm">
              <FavoriteIcon sx={{ fontSize: 40, color: '#ef4444' }} />
            </div>
            <h3 className="text-dark font-extrabold text-lg mb-2">Không tìm thấy người hiến phù hợp</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">Thử thay đổi nhóm máu hoặc giảm số lượng đơn vị máu cần thiết.</p>
          </div>
        )}

        {/* Results list */}
        {!isPending && !isSearching && searchDone && matchedDonors.length > 0 && (
          <div className="flex-1 overflow-auto bg-gray-50/50 p-4">
            <div className="flex flex-col gap-3">
              <AnimatePresence>
                {matchedDonors.map((donor, index) => (
                  <motion.div
                    key={donor.id}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-white rounded-2xl p-4 border transition-all ${
                      donor.status === 'confirmed'
                        ? 'border-success/30 shadow-sm bg-green-50/30'
                        : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Left Avatar / Rank */}
                      <div className="relative shrink-0">
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: '#Eff6ff',
                            color: '#3b82f6',
                            fontWeight: 800,
                            fontSize: '1rem',
                            border: donor.status === 'confirmed' ? '2px solid #22c55e' : 'none',
                          }}
                        >
                          #{index + 1}
                        </Avatar>
                        {index < 3 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border border-white text-[8px] flex items-center justify-center text-white" title="Top matches">
                            ★
                          </div>
                        )}
                      </div>

                      {/* Center Info */}
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-extrabold text-dark truncate">{donor.name}</h4>
                          <div className="bg-red-50 border border-red-100 text-primary text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                            <FavoriteIcon sx={{ fontSize: 10 }} /> {donor.bloodType}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                          <span className="flex items-center gap-0.5 truncate">
                            <LocationOnIcon sx={{ fontSize: 14, color: '#9ca3af' }} />
                            {donor.distance != null ? `${Number(donor.distance).toFixed(1)} km` : 'N/A'}
                          </span>
                          <span>•</span>
                          <span>{donor.phone}</span>
                        </div>
                      </div>

                      {/* Right Status + Action */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <StatusBadge status={donor.status} />

                        {donor.status === 'pending' && (
                          <button
                            onClick={() => handleSelectDonor(donor)}
                            disabled={loadingDonorId !== null}
                            className="text-xs font-bold bg-accent text-white px-3 py-1.5 rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1 shadow-sm shadow-blue-300/30"
                          >
                            {loadingDonorId === donor.id ? (
                              <CircularProgress size={11} sx={{ color: 'white' }} />
                            ) : (
                              <PersonAddIcon sx={{ fontSize: 13 }} />
                            )}
                            Chọn Donor
                          </button>
                        )}

                        {donor.status === 'confirmed' && (
                          <span className="text-[10px] font-bold text-success bg-green-50 px-2 py-0.5 rounded border border-green-100">
                            Đã thông báo
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
