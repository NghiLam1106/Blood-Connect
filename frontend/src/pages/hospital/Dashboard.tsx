import { useEffect, useState, useTransition } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Avatar,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Select,
  Slider,
  Typography,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PendingIcon from '@mui/icons-material/Pending'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../store/useStore'
import { runAIMatching, simulateDonorResponse } from '../../services/mockAI'
import type { BloodType, MatchedDonor } from '../../store/useStore'

const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const URGENCY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Bình thường', color: '#6b7280' },
  2: { label: 'Ưu tiên thấp', color: '#2563eb' },
  3: { label: 'Ưu tiên', color: '#d97706' },
  4: { label: 'Khẩn cấp', color: '#ea580c' },
  5: { label: 'Cực kỳ khẩn cấp', color: '#dc2626' },
}

function StatusBadge({ status }: { status: MatchedDonor['status'] }) {
  const config = {
    pending: { icon: <PendingIcon sx={{ fontSize: 14 }} />, label: 'Chờ phản hồi', color: '#f59e0b', bg: '#fffbeb' },
    confirmed: { icon: <DirectionsRunIcon sx={{ fontSize: 14 }} />, label: 'Đang đến', color: '#2563eb', bg: '#eff6ff' },
    arrived: { icon: <CheckCircleIcon sx={{ fontSize: 14 }} />, label: 'Đã đến', color: '#16a34a', bg: '#f0fdf4' },
    rejected: { icon: <></>, label: 'Từ chối', color: '#dc2626', bg: '#fef2f2' },
  }[status]

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      size="small"
      sx={{
        bgcolor: config.bg,
        color: config.color,
        fontWeight: 600,
        fontSize: '0.65rem',
        '& .MuiChip-icon': { color: config.color },
      }}
    />
  )
}

export default function HospitalDashboard() {
  const navigate = useNavigate()
  const { user, isAuthenticated, matchedDonors, isSearching, setMatchedDonors, setIsSearching, updateDonorStatus } =
    useStore()
  const [isPending, startTransition] = useTransition()
  const [bloodType, setBloodType] = useState<BloodType>('O+')
  const [quantity, setQuantity] = useState('2')
  const [urgency, setUrgency] = useState(3)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [searchDone, setSearchDone] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth/login')
  }, [isAuthenticated, navigate])

  const handleSearch = () => {
    setError('')
    if (!quantity || Number(quantity) < 1) {
      setError('Vui lòng nhập số lượng đơn vị máu cần thiết.')
      return
    }

    setSearchDone(false)
    setMatchedDonors([])
    setIsSearching(true)

    startTransition(async () => {
      const results = await runAIMatching({ bloodType, count: 10 })
      setMatchedDonors(results)
      setIsSearching(false)
      setSearchDone(true)

      // Simulate some donors auto-responding
      results.slice(0, 3).forEach((donor, i) => {
        setTimeout(() => {
          simulateDonorResponse(donor.id, updateDonorStatus)
        }, i * 1500)
      })
    })
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
            🏥
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-500 text-sm">Dashboard Bệnh viện • BloodConnect</p>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Hệ thống hoạt động
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ─── Request Form ─── */}
          <div className="lg:col-span-2">
            <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #e5e7eb', height: 'fit-content' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                  🩸 Tạo yêu cầu khẩn cấp
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

                <div className="space-y-4">
                  <FormControl fullWidth size="small">
                    <InputLabel>Nhóm máu cần</InputLabel>
                    <Select
                      value={bloodType}
                      label="Nhóm máu cần"
                      onChange={(e) => setBloodType(e.target.value as BloodType)}
                      sx={{ borderRadius: 2 }}
                    >
                      {BLOOD_TYPES.map((bt) => (
                        <MenuItem key={bt} value={bt}>
                          <span className="flex items-center gap-2">
                            <FavoriteIcon sx={{ fontSize: 14, color: '#dc2626' }} />
                            {bt}
                          </span>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số đơn vị máu (túi 250ml)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-700">Độ khẩn cấp</label>
                      <Chip
                        label={URGENCY_LABELS[urgency].label}
                        size="small"
                        sx={{ bgcolor: `${URGENCY_LABELS[urgency].color}20`, color: URGENCY_LABELS[urgency].color, fontWeight: 700 }}
                      />
                    </div>
                    <Slider
                      value={urgency}
                      min={1}
                      max={5}
                      step={1}
                      marks
                      onChange={(_, v) => setUrgency(v as number)}
                      sx={{
                        color: URGENCY_LABELS[urgency].color,
                        '& .MuiSlider-thumb': { width: 16, height: 16 },
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Bình thường</span>
                      <span>Cực khẩn</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (tuỳ chọn)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Thông tin thêm về ca phẫu thuật..."
                      rows={2}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition resize-none"
                    />
                  </div>

                  <button
                    onClick={handleSearch}
                    disabled={isPending || isSearching}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {(isPending || isSearching) ? (
                      <CircularProgress size={16} sx={{ color: 'white' }} />
                    ) : (
                      <SearchIcon fontSize="small" />
                    )}
                    {(isPending || isSearching) ? 'AI đang tìm kiếm...' : 'Tìm người hiến bằng AI'}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ─── Matching Results ─── */}
          <div className="lg:col-span-3">
            <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #e5e7eb' }}>
              <CardContent sx={{ p: 0 }}>
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <Typography variant="subtitle1" fontWeight={700}>
                    🤖 Kết quả AI Matching
                  </Typography>
                  {searchDone && (
                    <Chip
                      label={`${matchedDonors.length} người phù hợp`}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  )}
                </div>

                {/* Searching state */}
                {(isPending || isSearching) && (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="relative">
                      <CircularProgress size={48} sx={{ color: '#2563eb' }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg">🤖</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">AI đang quét người hiến trong bán kính 5km...</p>
                    <p className="text-xs text-gray-400">Đang phân tích nhóm máu, khoảng cách và lịch sử hiến</p>
                  </div>
                )}

                {/* Empty state */}
                {!isPending && !isSearching && !searchDone && (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                      <SearchIcon sx={{ fontSize: 32, color: '#2563eb' }} />
                    </div>
                    <p className="text-sm text-gray-500">Nhập thông tin yêu cầu và nhấn tìm kiếm để AI quét người hiến phù hợp</p>
                  </div>
                )}

                {/* Results list */}
                {!isPending && !isSearching && searchDone && (
                  <List disablePadding sx={{ maxHeight: 520, overflow: 'auto' }}>
                    <AnimatePresence>
                      {matchedDonors.map((donor, index) => (
                        <motion.div
                          key={donor.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.08 }}
                        >
                          <ListItem
                            sx={{
                              px: 3,
                              py: 1.5,
                              '&:hover': { bgcolor: '#f8fafc' },
                              bgcolor: donor.status === 'arrived' ? '#f0fdf4' : 'transparent',
                            }}
                            secondaryAction={
                              <div className="flex flex-col items-end gap-1">
                                <StatusBadge status={donor.status} />
                                {donor.status === 'confirmed' && (
                                  <span className="text-xs text-blue-500">~{donor.estimatedArrival} phút</span>
                                )}
                              </div>
                            }
                          >
                            <ListItemAvatar sx={{ minWidth: 48 }}>
                              <div className="relative">
                                <Avatar
                                  sx={{
                                    width: 36,
                                    height: 36,
                                    bgcolor: '#fee2e2',
                                    border: donor.status === 'arrived' ? '2px solid #16a34a' : 'none',
                                  }}
                                >
                                  <span className="text-sm text-red-600 font-bold">{index + 1}</span>
                                </Avatar>
                              </div>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-gray-800">{donor.name}</span>
                                  <Chip
                                    label={donor.bloodType}
                                    size="small"
                                    sx={{ fontSize: '0.6rem', height: 18, bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 700 }}
                                  />
                                </div>
                              }
                              secondary={
                                <span className="flex items-center gap-1 text-xs text-gray-400">
                                  <LocationOnIcon sx={{ fontSize: 12 }} />
                                  {donor.distance}km • {donor.phone}
                                </span>
                              }
                            />
                          </ListItem>
                          {index < matchedDonors.length - 1 && <Divider sx={{ mx: 3 }} />}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </List>
                )}
              </CardContent>
            </Card>

            {/* Stats summary after search */}
            {searchDone && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-3 gap-3 mt-3"
              >
                {[
                  { label: 'Đã xác nhận', value: matchedDonors.filter(d => d.status !== 'pending').length, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Đã đến', value: matchedDonors.filter(d => d.status === 'arrived').length, color: 'text-green-600', bg: 'bg-green-50' },
                  { label: 'Chờ phản hồi', value: matchedDonors.filter(d => d.status === 'pending').length, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((stat) => (
                  <div key={stat.label} className={`${stat.bg} rounded-xl p-3 text-center`}>
                    <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
