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
        className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
          }`}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 32, color: isDragActive ? '#2563eb' : '#94a3b8', mb: 0.5 }} />
        <p className="text-xs font-bold text-gray-700">
          {isDragActive ? 'Thả file vào đây...' : 'Kéo thả hoặc click upload'}
        </p>
      </div>

      {files.length > 0 && (
        <ul className="mt-2 space-y-1">
          {files.map((file, i) => (
            <li key={i} className="flex items-center gap-2 text-xs font-bold bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-100">
              <CheckCircleIcon fontSize="inherit" />
              <span className="truncate">{file.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

interface RegisterProps {
  asModal?: boolean;
  onClose?: () => void;
  onNavigate?: (path: string) => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HospitalRegister({ asModal = false, onClose, onNavigate }: RegisterProps) {
  const navigate = useNavigate()
  const login = useStore((s) => s.login)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [documents, setDocuments] = useState<File[]>([])

  const go = (path: string) => {
    if (asModal && onNavigate) onNavigate(path)
    else navigate(path)
  }

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
      setError('Vui lòng upload tối thiểu 1 file tài liệu.')
      return
    }

    startTransition(async () => {
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
    const successContent = (
      <div className={`w-full max-w-md mx-auto text-center ${asModal ? 'py-4' : 'bg-[#FFF7F7] rounded-3xl shadow-xl p-10'}`}>
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🏥</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Đăng ký thành công!</h2>
        <p className="text-gray-500 text-sm mb-2">
          Hồ sơ của <strong>{form.hospitalName}</strong> đang được xem xét.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs font-semibold text-amber-700 mb-6">
          ⏳ Thời gian xét duyệt: 1-3 ngày làm việc. Kết quả sẽ gửi qua email.
        </div>
        <button
          onClick={() => {
            if (onClose) onClose()
            navigate('/hospital/dashboard')
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition"
        >
          Đến Dashboard Demo →
        </button>
      </div>
    )

    if (asModal) return successContent;
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
        {successContent}
      </div>
    )
  }

  const content = (
    <div className={`w-full max-w-lg mx-auto ${asModal ? 'px-2' : ''}`}>
      {!asModal && (
        <button
          onClick={() => go(-1 as any)}
          className="flex items-center gap-1 text-gray-500 hover:text-blue-600 mb-6 text-sm transition-colors bg-transparent border-none cursor-pointer"
        >
          <ArrowBackIcon fontSize="small" /> Quay lại
        </button>
      )}

      {asModal && (
        <button
          onClick={() => go('/auth')}
          className="flex items-center gap-1 text-gray-500 hover:text-blue-600 mb-2 mt-2 text-xs font-bold transition-colors bg-transparent border-none cursor-pointer p-0"
        >
          <ArrowBackIcon fontSize="inherit" /> Đổi vai trò
        </button>
      )}

      <div className={`${!asModal ? 'bg-[#FFF7F7] rounded-3xl shadow-xl p-8 border border-blue-100' : ''}`}>
        <div className={`text-center ${asModal ? 'mb-4' : 'mb-6'}`}>
          {!asModal && (
            <div className="inline-flex w-12 h-12 bg-blue-600 rounded-xl items-center justify-center mb-3">
              <span className="text-2xl">🏥</span>
            </div>
          )}
          <h1 className={`${asModal ? 'text-xl' : 'text-2xl'} font-bold text-gray-900`}>Đăng ký Bệnh viện</h1>
        </div>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Tên bệnh viện / cơ sở y tế *</label>
            <input
              type="text"
              value={form.hospitalName}
              onChange={setField('hospitalName')}
              placeholder="VD: Bệnh viện Bạch Mai"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Mã giấy phép *</label>
              <input
                type="text"
                value={form.licenseCode}
                onChange={setField('licenseCode')}
                placeholder="GP-XXXXX"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Tỉnh / Thành phố *</label>
              <select
                value={form.province}
                onChange={setField('province')}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition bg-white"
              >
                <option value="">Chọn khu vực...</option>
                {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email liên hệ *</label>
              <input
                type="email"
                value={form.email}
                onChange={setField('email')}
                placeholder="admin@benhvien.vn"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Mật khẩu *</label>
              <input
                type="password"
                value={form.password}
                onChange={setField('password')}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
          </div>

          {/* Document Upload */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Tài liệu xác minh *</label>
            <DocumentDropzone files={documents} onFiles={setDocuments} />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
          >
            {isPending ? <CircularProgress size={16} sx={{ color: 'white' }} /> : null}
            {isPending ? 'Đang gửi hồ sơ...' : '🏥 Tham gia hệ thống'}
          </button>
        </form>
      </div>
    </div>
  )

  if (asModal) return content;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
      {content}
    </div>
  )
}
