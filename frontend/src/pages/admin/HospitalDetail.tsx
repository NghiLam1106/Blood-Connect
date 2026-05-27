import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { HospitalItem } from '../../services/admin.service'
import { getHospitals, verifyHospital } from '../../services/admin.service'

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
          {value ?? <span className="text-gray-300 italic font-normal">Chưa có</span>}
        </p>
      </div>
    </div>
  )
}

function DownloadButton({ url, name }: { url: string; name: string }) {
  // Với Cloudinary raw URL, thêm fl_attachment vào để force download
  const getDownloadUrl = (originalUrl: string) => {
    // https://res.cloudinary.com/{cloud}/raw/upload/v.../file.pdf
    // → https://res.cloudinary.com/{cloud}/raw/upload/fl_attachment/v.../file.pdf
    return originalUrl.replace('/raw/upload/', '/raw/upload/fl_attachment/')
  }

  return (
    <a
      href={getDownloadUrl(url)}
      download={`giay-phep-${name.replace(/\s+/g, '-')}.pdf`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-purple-200 bg-purple-50 text-purple-600 text-sm font-bold hover:bg-purple-100 transition-colors"
    >
      📄 Tải về tài liệu PDF
    </a>
  )
}

export default function HospitalDetail() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()

  const [hospital, setHospital] = useState<HospitalItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [pending, setPending] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    // Fetch danh sách và tìm theo userId (reuse existing API)
    getHospitals({ limit: 100 })
      .then((res) => {
        const found = res.data.find((h) => h.userId === Number(userId))
        if (found) {
          setHospital(found)
        } else {
          setNotFound(true)
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [userId])

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleVerify = async (newValue: boolean) => {
    if (!hospital) return
    setPending(true)
    try {
      await verifyHospital(hospital.userId, newValue)
      setHospital((prev) => prev ? { ...prev, isVerified: newValue } : prev)
      showToast(
        newValue ? 'Đã xác minh bệnh viện thành công!' : 'Đã thu hồi xác minh bệnh viện!',
        'success'
      )
    } catch {
      showToast('Có lỗi xảy ra, vui lòng thử lại!', 'error')
    } finally {
      setPending(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded-xl w-48" />
          <div className="bg-white rounded-2xl p-6 space-y-4 border border-gray-100">
            {Array.from({ length: 5 }).map((_, i) => (
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
        <LocalHospitalOutlinedIcon style={{ fontSize: 48 }} className="text-gray-300 mb-4" />
        <p className="text-gray-400 font-semibold text-lg">Không tìm thấy bệnh viện</p>
        <button
          onClick={() => navigate('/admin/hospitals')}
          className="mt-6 px-5 py-2 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 transition-colors"
        >
          Quay lại danh sách
        </button>
      </div>
    )
  }

  const address = [hospital.address].filter(Boolean).join(', ') || null

  return (
    <div className="max-w-2xl mx-auto">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all ${
            toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Back button */}
      <button
        onClick={() => navigate('/admin/hospitals')}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-purple-600 font-semibold mb-6 transition-colors"
      >
        <ArrowBackIcon style={{ fontSize: 18 }} />
        Quay lại danh sách
      </button>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center flex-shrink-0">
              <LocalHospitalOutlinedIcon style={{ fontSize: 28 }} className="text-purple-500" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-dark leading-tight">{hospital.name}</h1>
              <p className="text-xs text-gray-400 mt-0.5">ID người dùng: #{hospital.userId}</p>
            </div>
          </div>

          {/* Status badge */}
          <div className="flex-shrink-0">
            {hospital.isVerified ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <CheckCircleOutlineIcon style={{ fontSize: 14 }} />
                Đã xác minh
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-500 border border-amber-200">
                <RemoveCircleOutlineIcon style={{ fontSize: 14 }} />
                Chờ duyệt
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Info card */}
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

      {/* License card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Hồ sơ pháp lý</h2>
        <InfoRow
          icon={<VerifiedUserOutlinedIcon style={{ fontSize: 18 }} />}
          label="Mã giấy phép hành nghề"
          value={hospital.licenseCode}
        />
        <div className="flex items-start gap-3 py-3 border-b border-gray-50">
          <span className="text-gray-400 mt-0.5">📅</span>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Ngày đăng ký</p>
            <p className="text-sm font-semibold text-dark">{formatDate(hospital.createdAt)}</p>
          </div>
        </div>

        {/* License file */}
        <div className="flex items-start gap-3 py-3">
          <span className="text-gray-400 mt-0.5">
            <VerifiedUserOutlinedIcon style={{ fontSize: 18 }} />
          </span>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tài liệu xác minh</p>
            {hospital.licenseFile ? (
              <DownloadButton url={hospital.licenseFile} name={hospital.name} />
            ) : (
              <span className="text-sm text-gray-300 italic font-normal">Chưa có tài liệu</span>
            )}
          </div>
        </div>
      </div>

      {/* Action button */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Hành động xác minh</h2>
        {hospital.isVerified ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Bệnh viện này đang được xác minh và có thể đăng nhập vào hệ thống.
            </p>
            <button
              onClick={() => handleVerify(false)}
              disabled={pending}
              className="ml-4 flex-shrink-0 px-5 py-2.5 text-sm font-bold rounded-xl border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pending ? 'Đang xử lý...' : 'Thu hồi xác minh'}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Bệnh viện này chưa được xác minh. Duyệt để cho phép đăng nhập vào hệ thống.
            </p>
            <button
              onClick={() => handleVerify(true)}
              disabled={pending}
              className="ml-4 flex-shrink-0 px-5 py-2.5 text-sm font-bold rounded-xl border border-emerald-200 bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pending ? 'Đang xử lý...' : '✓ Duyệt bệnh viện'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
