import {
  Avatar,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Typography,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { motion, AnimatePresence } from 'framer-motion'
import { StatusBadge } from './StatusBadge'
import type { MatchedDonor } from '../../store/useStore'

interface MatchingResultsProps {
  searchDone: boolean
  matchedDonors: MatchedDonor[]
  isPending: boolean
  isSearching: boolean
}

export function MatchingResults({
  searchDone,
  matchedDonors,
  isPending,
  isSearching,
}: MatchingResultsProps) {
  return (
    <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #EFF6FF', boxShadow: '0 4px 20px -4px rgba(59,130,246,0.05)', height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                { label: 'Đã xác nhận', value: matchedDonors.filter(d => d.status !== 'pending' && d.status !== 'rejected').length, color: 'text-accent', bg: 'bg-white', border: 'border-blue-100' },
                { label: 'Đã đến', value: matchedDonors.filter(d => d.status === 'arrived').length, color: 'text-success', bg: 'bg-white', border: 'border-green-100' },
                { label: 'Chờ phản hồi', value: matchedDonors.filter(d => d.status === 'pending').length, color: 'text-secondary', bg: 'bg-white', border: 'border-orange-100' },
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
              <p className="text-base text-dark font-extrabold mb-1">AI đang quét dữ liệu trong bán kính 5km...</p>
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
            <h3 className="text-dark font-extrabold text-lg mb-2">Chưa có kết quả chờ</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">Vui lòng thiết lập thông số yêu cầu & kích hoạt AI Matching để tìm người hiến phù hợp.</p>
          </div>
        )}

        {/* Results list */}
        {!isPending && !isSearching && searchDone && (
          <div className="flex-1 overflow-auto bg-gray-50/50 p-4">
            <div className="flex flex-col gap-3">
              <AnimatePresence>
                {matchedDonors.map((donor, index) => (
                  <motion.div
                    key={donor.id}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-white rounded-2xl p-4 border transition-all ${donor.status === 'arrived' ? 'border-success/30 shadow-sm bg-success/5' : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'}`}
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
                            border: donor.status === 'arrived' ? '2px solid #22c55e' : 'none',
                          }}
                        >
                          #{index + 1}
                        </Avatar>
                        {index < 3 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border border-white text-[8px] flex items-center justify-center text-white" title="Top matches">★</div>}
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
                            {donor.distance}km
                          </span>
                          <span>•</span>
                          <span>{donor.phone}</span>
                        </div>
                      </div>

                      {/* Right Status */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <StatusBadge status={donor.status} />
                        {donor.status === 'confirmed' && (
                          <span className="text-[10px] font-bold text-accent bg-blue-50 px-2 py-0.5 rounded">
                            Tới chừng: {donor.estimatedArrival} phút
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
