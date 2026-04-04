import { useCallback, useState, useTransition } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { Alert, CircularProgress } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useStore } from '../../store/useStore'

const PROVINCES = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng',
  'Bình Dương', 'Đồng Nai', 'Khánh Hòa', 'Thừa Thiên Huế', 'Nghệ An',
]

// ─── Dropzone Component ───────────────────────────────────────────────────────
function DocumentDropzone({
  files,
  onFiles,
}: {
  files: File[]
  onFiles: (files: File[]) => void
}) {
  const onDrop = useCallback(
    (accepted: File[]) => onFiles([...files, ...accepted]),
    [files, onFiles]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
        }`}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 40, color: isDragActive ? '#2563eb' : '#94a3b8', mb: 1 }} />
        <p className="text-sm font-medium text-gray-700">
          {isDragActive ? 'Thả file vào đây...' : 'Kéo thả hoặc click để upload'}
        </p>
        <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG – tối đa 10MB mỗi file</p>
      </div>

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((file, i) => (
            <li key={i} className="flex items-center gap-2 text-sm bg-green-50 text-green-700 px-3 py-2 rounded-lg">
              <CheckCircleIcon fontSize="small" />
              <span className="truncate">{file.name}</span>
              <span className="ml-auto text-xs text-green-500">
                {(file.size / 1024).toFixed(0)}KB
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HospitalRegister() {
  const navigate = useNavigate()
  const login = useStore((s) => s.login)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [documents, setDocuments] = useState<File[]>([])

  const [form, setForm] = useState({
    hospitalName: '',
    licenseCode: '',
    province: '',
    email: '',
    phone: '',
    password: '',
  })

  const setField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.hospitalName || !form.licenseCode || !form.province || !form.email || !form.password) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc.')
      return
    }
    if (documents.length === 0) {
      setError('Vui lòng upload ít nhất 1 tài liệu xác minh.')
      return
    }

    startTransition(async () => {
      // Simulate registration delay
      await new Promise((r) => setTimeout(r, 1800))
      login({
        id: `hospital-${Date.now()}`,
        name: form.hospitalName,
        email: form.email,
        phone: form.phone,
        role: 'hospital',
      })
      setSuccess(true)
    })
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🏥</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Đăng ký thành công!</h2>
          <p className="text-gray-500 text-sm mb-2">
            Hồ sơ của <strong>{form.hospitalName}</strong> đang được xem xét.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 mb-6">
            ⏳ Thời gian xét duyệt: 1-3 ngày làm việc. Kết quả sẽ được gửi qua email.
          </div>
          <button
            onClick={() => navigate('/hospital/dashboard')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
          >
            Đến Dashboard Demo →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-500 hover:text-blue-600 mb-6 text-sm transition-colors bg-transparent border-none cursor-pointer"
        >
          <ArrowBackIcon fontSize="small" /> Quay lại
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-blue-100">
          <div className="text-center mb-6">
            <div className="inline-flex w-12 h-12 bg-blue-600 rounded-xl items-center justify-center mb-3">
              <span className="text-2xl">🏥</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Đăng ký Bệnh viện</h1>
            <p className="text-gray-500 text-sm mt-1">Tham gia mạng lưới cơ sở y tế BloodConnect</p>
          </div>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên bệnh viện / cơ sở y tế *</label>
              <input
                type="text"
                value={form.hospitalName}
                onChange={setField('hospitalName')}
                placeholder="Bệnh viện Bạch Mai"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã giấy phép hoạt động *</label>
                <input
                  type="text"
                  value={form.licenseCode}
                  onChange={setField('licenseCode')}
                  placeholder="GP-2024-XXXXX"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh / Thành phố *</label>
                <select
                  value={form.province}
                  onChange={setField('province')}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition bg-white"
                >
                  <option value="">Chọn tỉnh...</option>
                  {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email liên hệ *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={setField('email')}
                  placeholder="admin@benhvien.vn"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={setField('phone')}
                  placeholder="024 XXXX XXXX"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu *</label>
              <input
                type="password"
                value={form.password}
                onChange={setField('password')}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            {/* Document Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tài liệu xác minh *
                <span className="ml-1 text-xs text-gray-400">(Giấy phép, chứng chỉ...)</span>
              </label>
              <DocumentDropzone files={documents} onFiles={setDocuments} />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isPending ? <CircularProgress size={16} sx={{ color: 'white' }} /> : null}
              {isPending ? 'Đang xử lý...' : '🏥 Gửi đăng ký'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
