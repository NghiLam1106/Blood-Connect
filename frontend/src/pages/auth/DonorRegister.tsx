import { useCallback, useRef, useState, useTransition } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import type { BloodType } from '../../store/useStore'
import { useStore } from '../../store/useStore'
import { sendOTP, verifyOTP } from '../../services/mockOTP'

const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const STEPS = ['Thông tin cá nhân', 'Xác thực OTP', 'Hoàn tất']

// ─── OTP Input Grid ────────────────────────────────────────────────────────────
function OTPInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const handleKey = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return
    const chars = value.padEnd(6, ' ').split('')
    chars[index] = char.slice(-1) || ' '
    const next = chars.join('').trimEnd()
    onChange(next)
    if (char && index < 5) {
      inputs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted)
    inputs.current[Math.min(pasted.length, 5)]?.focus()
  }

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all
            border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-gray-50"
        />
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DonorRegister() {
  const navigate = useNavigate()
  const login = useStore((s) => s.login)
  const [activeStep, setActiveStep] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpInfo, setOtpInfo] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    bloodType: '' as BloodType | '',
    password: '',
    confirmPassword: '',
  })

  const setField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  // Step 1: Submit info and send OTP
  const handleStep1 = () => {
    setError('')
    if (!form.name || !form.email || !form.phone || !form.bloodType || !form.password) {
      setError('Vui lòng điền đầy đủ thông tin.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }
    if (!/^(0[3|5|7|8|9])\d{8}$/.test(form.phone)) {
      setError('Số điện thoại không hợp lệ.')
      return
    }

    startTransition(async () => {
      const result = await sendOTP(form.phone)
      if (result.success) {
        setOtpInfo(result.message)
        setOtpSent(true)
        setActiveStep(1)
      } else {
        setError('Gửi OTP thất bại. Thử lại sau.')
      }
    })
  }

  // Step 2: Verify OTP
  const handleStep2 = () => {
    setError('')
    if (otpCode.length !== 6) {
      setError('Vui lòng nhập đủ 6 chữ số OTP.')
      return
    }

    startTransition(async () => {
      const result = await verifyOTP(form.phone, otpCode)
      if (result.success) {
        login({
          id: `donor-${Date.now()}`,
          name: form.name,
          email: form.email,
          phone: form.phone,
          role: 'donor',
          bloodType: form.bloodType as BloodType,
          totalDonations: 0,
        })
        setActiveStep(2)
      } else {
        setError(result.message)
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-500 hover:text-red-600 mb-6 text-sm transition-colors bg-transparent border-none cursor-pointer"
        >
          <ArrowBackIcon fontSize="small" /> Quay lại
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-rose-100">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex w-12 h-12 bg-red-600 rounded-xl items-center justify-center mb-3">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
                <path d="M12 2.4C9.3 6.1 6 9.5 6 13.5A6 6 0 1 0 18 13.5C18 9.5 14.7 6.1 12 2.4z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Đăng ký Người hiến</h1>
            <p className="text-gray-500 text-sm mt-1">Tham gia cộng đồng cứu người</p>
          </div>

          {/* MUI Stepper */}
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel sx={{ '& .MuiStepLabel-label': { fontSize: '0.72rem' } }}>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          {/* ─── Step 0: Personal Info ─── */}
          {activeStep === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={setField('name')}
                  placeholder="Nguyễn Văn An"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={setField('email')}
                  placeholder="example@email.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={setField('phone')}
                  placeholder="0901234567"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition"
                />
              </div>
              <FormControl fullWidth size="small">
                <InputLabel>Nhóm máu *</InputLabel>
                <Select
                  value={form.bloodType}
                  label="Nhóm máu *"
                  onChange={(e) => setForm((p) => ({ ...p, bloodType: e.target.value as BloodType }))}
                  sx={{ borderRadius: 3 }}
                >
                  {BLOOD_TYPES.map((bt) => (
                    <MenuItem key={bt} value={bt}>{bt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={setField('password')}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu *</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={setField('confirmPassword')}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition"
                />
              </div>
              <button
                onClick={handleStep1}
                disabled={isPending}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isPending ? <CircularProgress size={16} sx={{ color: 'white' }} /> : null}
                {isPending ? 'Đang gửi OTP...' : 'Tiếp theo →'}
              </button>
            </div>
          )}

          {/* ─── Step 1: OTP ─── */}
          {activeStep === 1 && (
            <div className="space-y-6 text-center">
              <div className="bg-blue-50 rounded-2xl p-4 text-sm text-blue-700">{otpInfo}</div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                💡 Trong môi trường dev: Nhập <strong>123456</strong> để xác thực, hoặc xem console trình duyệt để lấy OTP thật.
              </div>
              <OTPInput value={otpCode} onChange={setOtpCode} />
              <button
                onClick={handleStep2}
                disabled={isPending || otpCode.length !== 6}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isPending ? <CircularProgress size={16} sx={{ color: 'white' }} /> : null}
                {isPending ? 'Đang xác thực...' : 'Xác nhận OTP'}
              </button>
              <button
                onClick={() => { setOtpCode(''); handleStep1() }}
                className="text-sm text-red-600 hover:underline bg-transparent border-none cursor-pointer"
              >
                Gửi lại OTP
              </button>
            </div>
          )}

          {/* ─── Step 2: Success ─── */}
          {activeStep === 2 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-4xl">✅</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Đăng ký thành công!</h2>
              <p className="text-gray-500 text-sm">
                Chào mừng <strong>{form.name}</strong> đến với BloodConnect. Hãy vào Dashboard để bật trạng thái sẵn sàng hiến máu.
              </p>
              <button
                onClick={() => navigate('/donor/dashboard')}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-all"
              >
                Đến Dashboard →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
