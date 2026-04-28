import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import { useStore } from '../../store/useStore'

export function EmergencyAlertBanner() {
  const { activeAlert, setActiveAlert } = useStore()
  const [confirmed, setConfirmed] = useState(false)

  if (!activeAlert) return null

  if (confirmed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl bg-success/10 border border-success/20 p-6 flex flex-col md:flex-row items-start md:items-center gap-4 shadow-sm"
      >
        <div className="w-12 h-12 bg-success text-white rounded-full flex items-center justify-center shrink-0 shadow-md">
          <CheckCircleIcon fontSize="medium" />
        </div>
        <div className="flex-1">
          <p className="font-extrabold text-success text-lg mb-1">Đã xác nhận hỗ trợ!</p>
          <p className="text-gray-600 text-sm">
            Cảm ơn bạn! Hệ thống đã gửi thông báo đến <strong>{activeAlert.hospitalName}</strong>. Vui lòng di chuyển đến bệnh viện theo bản đồ.
          </p>
          <a
            href={activeAlert.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 bg-white border border-gray-200 text-dark font-bold px-4 py-2 rounded-xl text-xs hover:border-success transition-all shadow-sm"
          >
            📍 Xem đường đi trên Google Maps →
          </a>
        </div>
        <button
          onClick={() => { setActiveAlert(null); setConfirmed(false) }}
          className="ml-auto bg-white border border-gray-200 text-gray-500 font-bold px-4 py-2 rounded-xl text-xs hover:bg-gray-50 shrink-0 mt-4 md:mt-0"
        >
          Đóng
        </button>
      </motion.div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          boxShadow: ['0 0 0 0 rgba(239, 68, 68, 0)', '0 0 0 15px rgba(239, 68, 68, 0.1)', '0 0 0 0 rgba(239, 68, 68, 0)'],
        }}
        transition={{ boxShadow: { repeat: Infinity, duration: 2 } }}
        className="rounded-3xl bg-primary text-white p-6 relative overflow-hidden shadow-xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>

        <div className="relative z-10 flex flex-col md:flex-row gap-6">
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 2 }}
            className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shrink-0 border border-white/30"
          >
            <NotificationsActiveIcon sx={{ fontSize: 32 }} />
          </motion.div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="font-extrabold text-xl">🚨 YÊU CẦU KHẨN CẤP</span>
              <span className="bg-white text-primary text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                Nhóm máu {activeAlert.bloodType}
              </span>
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
                Khẩn cấp mức {activeAlert.urgencyLevel}
              </span>
            </div>

            <p className="text-red-50 text-base mb-1 font-medium">
              <strong>{activeAlert.hospitalName}</strong> đang cần máu gấp để thực hiện ca phẫu thuật.
            </p>

            <p className="text-red-100 text-sm flex items-center gap-1 mb-4">
              <LocationOnIcon fontSize="small" />
              {activeAlert.hospitalAddress} • Cách bạn <strong className="text-white underline">{activeAlert.distance}km</strong>
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setConfirmed(true)}
                className="bg-white text-primary font-bold px-6 py-3 rounded-xl hover:scale-105 transition-all text-sm shadow-md"
              >
                ✅ Chấp nhận hỗ trợ ngay
              </button>
              <a
                href={activeAlert.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/20 border border-white/30 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/30 transition-all text-sm shadow-md no-underline"
              >
                📍 Xem bản đồ
              </a>
              <button
                onClick={() => setActiveAlert(null)}
                className="px-4 text-red-200 hover:text-white font-semibold text-sm transition-colors uppercase tracking-widest ml-auto md:ml-0 mt-2 md:mt-0"
              >
                Từ chối
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
