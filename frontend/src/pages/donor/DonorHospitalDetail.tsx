import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { HospitalItem } from '../../services/admin.service'
import { getHospitals } from '../../services/admin.service'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <span className="text-gray-400 mt-0.5">{icon}</span>
      <div className="flex-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-dark">
          {value ?? <span className="text-gray-300 italic font-normal">Chưa có thông tin</span>}
        </p>
      </div>
    </div>
  )
}

export default function DonorHospitalDetail() {
  const { hospitalId } = useParams<{ hospitalId: string }>()
  const navigate = useNavigate()

  const [hospital, setHospital] = useState<HospitalItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!hospitalId) return
    setLoading(true)
    getHospitals({ limit: 200 })
      .then((res) => {
        const found = res.data.find((h) => h.hospitalId === Number(hospitalId))
        if (found) {
          setHospital(found)
        } else {
          setNotFound(true)
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [hospitalId])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded-xl w-48" />
          <div className="bg-white rounded-2xl p-6 space-y-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gray-200" />
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-gray-200 rounded-lg w-2/3" />
                <div className="h-3 bg-gray-100 rounded-lg w-1/3" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 space-y-4 border border-gray-100 shadow-sm">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !hospital) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <LocalHospitalOutlinedIcon style={{ fontSize: 40 }} className="text-red-300" />
        </div>
        <p className="text-gray-500 font-bold text-lg mb-1">Không tìm thấy bệnh viện</p>
        <p className="text-gray-400 text-sm mb-6">Bệnh viện này có thể không còn tồn tại trong hệ thống.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 bg-accent text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
        >
          ← Quay lại
        </button>
      </div>
    )
  }

  const address = hospital.address ?? null

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-accent font-semibold mb-6 transition-colors"
      >
        <ArrowBackIcon style={{ fontSize: 18 }} />
        Quay lại lịch sử hiến máu
      </button>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <LocalHospitalOutlinedIcon style={{ fontSize: 28 }} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-dark leading-tight">{hospital.name}</h1>
              <p className="text-xs text-gray-400 mt-0.5">Thông tin bệnh viện</p>
            </div>
          </div>

          {/* Verification badge */}
          <div className="flex-shrink-0">
            {hospital.isVerified ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <CheckCircleOutlineIcon style={{ fontSize: 14 }} />
                Đã xác minh
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-500 border border-amber-200">
                <RemoveCircleOutlineIcon style={{ fontSize: 14 }} />
                Chờ xác minh
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contact info card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Thông tin liên hệ</h2>
        <InfoRow
          icon={<EmailOutlinedIcon style={{ fontSize: 18 }} />}
          label="Email"
          value={hospital.email}
        />
        <InfoRow
          icon={<PhoneOutlinedIcon style={{ fontSize: 18 }} />}
          label="Số điện thoại"
          value={hospital.phone}
        />
        <InfoRow
          icon={<LocationOnOutlinedIcon style={{ fontSize: 18 }} />}
          label="Địa chỉ"
          value={address}
        />
      </div>

      {/* Registration info card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Thông tin đăng ký</h2>
        <div className="flex items-start gap-3 py-3">
          <span className="text-gray-400 mt-0.5">
            <CalendarTodayOutlinedIcon style={{ fontSize: 18 }} />
          </span>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Ngày tham gia hệ thống</p>
            <p className="text-sm font-semibold text-dark">{formatDate(hospital.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
