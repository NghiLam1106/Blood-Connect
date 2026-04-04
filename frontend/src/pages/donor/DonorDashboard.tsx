import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Avatar,
  Badge,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Switch,
  Typography,
} from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useStore } from '../../store/useStore'

// Mock donation history
const DONATION_HISTORY = [
  { id: 1, date: '15/01/2025', hospital: 'BV Bạch Mai', type: 'O+', volume: '350ml', status: 'completed' },
  { id: 2, date: '10/09/2024', hospital: 'BV Chợ Rẫy', type: 'O+', volume: '350ml', status: 'completed' },
  { id: 3, date: '20/04/2024', hospital: 'BV Việt Đức', type: 'O+', volume: '250ml', status: 'completed' },
  { id: 4, date: '05/11/2023', hospital: 'BV 108', type: 'O+', volume: '350ml', status: 'completed' },
  { id: 5, date: '12/07/2023', hospital: 'BV Nhi TW', type: 'O+', volume: '250ml', status: 'completed' },
]

// ─── Emergency Alert Banner ────────────────────────────────────────────────────
function EmergencyAlertBanner() {
  const { activeAlert, setActiveAlert } = useStore()
  const [confirmed, setConfirmed] = useState(false)

  if (!activeAlert) return null

  if (confirmed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-green-50 border border-green-200 p-5 flex items-start gap-4"
      >
        <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 32, flexShrink: 0 }} />
        <div>
          <p className="font-bold text-green-800 text-base">Đã xác nhận hỗ trợ!</p>
          <p className="text-green-600 text-sm mt-0.5">
            Cảm ơn bạn! Vui lòng đến <strong>{activeAlert.hospitalName}</strong> sớm nhất có thể.
          </p>
          <a
            href={activeAlert.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-sm text-blue-600 hover:underline"
          >
            📍 Xem đường đi trên Google Maps →
          </a>
        </div>
        <button
          onClick={() => { setActiveAlert(null); setConfirmed(false) }}
          className="ml-auto text-xs text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer"
        >
          ✕
        </button>
      </motion.div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: 1,
          scale: 1,
          boxShadow: ['0 0 0 0 rgba(220,38,38,0)', '0 0 0 12px rgba(220,38,38,0.15)', '0 0 0 0 rgba(220,38,38,0)'],
        }}
        transition={{ boxShadow: { repeat: Infinity, duration: 1.8 } }}
        className="rounded-2xl bg-red-600 text-white p-5 relative overflow-hidden"
      >
        {/* Animated background pulse */}
        <motion.div
          className="absolute inset-0 bg-red-500 rounded-2xl"
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
        />

        <div className="relative z-10">
          <div className="flex items-start gap-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <NotificationsActiveIcon sx={{ fontSize: 28 }} />
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-lg">🚨 YÊU CẦU KHẨN CẤP</p>
                <Chip
                  label={`Nhóm ${activeAlert.bloodType}`}
                  size="small"
                  sx={{ bgcolor: 'white', color: '#dc2626', fontWeight: 700 }}
                />
              </div>
              <p className="text-red-100 text-sm">
                <strong>{activeAlert.hospitalName}</strong> cần máu khẩn cấp
              </p>
              <p className="text-red-200 text-xs mt-0.5">
                📍 {activeAlert.hospitalAddress} • cách bạn <strong>{activeAlert.distance}km</strong>
              </p>
              <p className="text-red-200 text-xs">
                🔴 Mức độ khẩn cấp: {'●'.repeat(activeAlert.urgencyLevel)}{'○'.repeat(5 - activeAlert.urgencyLevel)}
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setConfirmed(true)}
              className="flex-1 bg-white text-red-600 font-bold py-2.5 rounded-xl hover:bg-red-50 transition text-sm"
            >
              ✅ Xác nhận hỗ trợ
            </button>
            <a
              href={activeAlert.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-red-700 text-white font-bold py-2.5 rounded-xl hover:bg-red-800 transition text-sm text-center no-underline flex items-center justify-center gap-1"
            >
              <LocationOnIcon fontSize="small" />
              Xem bản đồ
            </a>
            <button
              onClick={() => setActiveAlert(null)}
              className="bg-red-700/50 text-white px-3 rounded-xl hover:bg-red-800 transition text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DonorDashboard() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isAvailable, setAvailable, setActiveAlert, activeAlert } = useStore()

  // Auto-redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) navigate('/auth/login')
  }, [isAuthenticated, navigate])

  // Simulate incoming emergency after 8s if available
  useEffect(() => {
    if (!isAvailable || activeAlert) return
    const timer = setTimeout(() => {
      setActiveAlert({
        id: `alert-${Date.now()}`,
        bloodType: user?.bloodType ?? 'O+',
        hospitalName: 'Bệnh viện Bạch Mai',
        hospitalAddress: '78 Giải Phóng, Đống Đa, Hà Nội',
        distance: 1.8,
        urgencyLevel: 4,
        mapsUrl: `https://www.google.com/maps/search/bệnh+viện+bạch+mai/@21.0011696,105.8424163`,
      })
    }, 8000)
    return () => clearTimeout(timer)
  }, [isAvailable, activeAlert, setActiveAlert, user?.bloodType])

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Xin chào, {user.name.split(' ').pop()}! 👋</h1>
          <p className="text-gray-500 text-sm">Cảm ơn bạn đã tham gia cộng đồng hiến máu BloodConnect</p>
        </div>

        {/* Emergency Alert */}
        <div className="mb-6">
          <EmergencyAlertBanner />
        </div>

        {/* Status Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: '1px solid',
            borderColor: isAvailable ? '#bbf7d0' : '#e5e7eb',
            background: isAvailable ? 'linear-gradient(135deg, #f0fdf4, white)' : 'white',
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <div className="flex items-center gap-4">
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <div className={`w-4 h-4 rounded-full border-2 border-white ${isAvailable ? 'bg-green-500' : 'bg-gray-300'}`} />
                }
              >
                <Avatar sx={{ width: 60, height: 60, bgcolor: '#dc2626', fontSize: '1.5rem' }}>
                  {user.name.charAt(0)}
                </Avatar>
              </Badge>
              <div className="flex-1">
                <Typography variant="subtitle1" fontWeight={700}>{user.name}</Typography>
                <div className="flex items-center gap-2 mt-0.5">
                  <Chip
                    icon={<FavoriteIcon sx={{ fontSize: '14px !important' }} />}
                    label={`Nhóm ${user.bloodType}`}
                    size="small"
                    sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 700 }}
                  />
                  <span className="text-xs text-gray-400">{user.phone}</span>
                </div>
              </div>
              <div className="text-right">
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {isAvailable ? '🟢 Sẵn sàng' : '⚫ Không sẵn sàng'}
                </Typography>
                <Switch
                  checked={isAvailable}
                  onChange={(_, val) => setAvailable(val)}
                  color="success"
                  size="medium"
                />
              </div>
            </div>

            {isAvailable && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 pt-3 border-t border-green-100 text-sm text-green-700 bg-green-50 rounded-xl px-3 py-2"
              >
                ✅ Bạn đang trong trạng thái sẵn sàng. Chúng tôi sẽ thông báo nếu có yêu cầu máu phù hợp gần bạn.
                {!activeAlert && (
                  <span className="block text-xs text-green-500 mt-0.5">
                    💡 Demo: Alert khẩn cấp sẽ xuất hiện sau ~8 giây
                  </span>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Lần hiến', value: user.totalDonations ?? 5, icon: '💉', color: 'text-red-600' },
            { label: 'Năm nay', value: 0, icon: '📅', color: 'text-blue-600' },
            { label: 'Điểm tích lũy', value: (user.totalDonations ?? 5) * 100, icon: '⭐', color: 'text-amber-500' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm"
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Donation History */}
        <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #f1f5f9' }}>
          <CardContent sx={{ p: 0 }}>
            <div className="px-4 py-3 border-b border-gray-100">
              <Typography variant="subtitle1" fontWeight={700}>Lịch sử hiến máu</Typography>
            </div>
            <List disablePadding>
              {DONATION_HISTORY.map((item, index) => (
                <div key={item.id}>
                  <ListItem sx={{ px: 3, py: 1.5 }}>
                    <ListItemAvatar sx={{ minWidth: 44 }}>
                      <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center">
                        <FavoriteIcon sx={{ fontSize: 16, color: '#dc2626' }} />
                      </div>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <span className="text-sm font-medium text-gray-800">{item.hospital}</span>
                      }
                      secondary={
                        <span className="text-xs text-gray-400">{item.date} • {item.volume}</span>
                      }
                    />
                    <Chip
                      label={item.type}
                      size="small"
                      sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontSize: '0.7rem', fontWeight: 700 }}
                    />
                  </ListItem>
                  {index < DONATION_HISTORY.length - 1 && <Divider sx={{ mx: 3 }} />}
                </div>
              ))}
            </List>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
