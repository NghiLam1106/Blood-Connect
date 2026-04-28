import { useRef, useState, useTransition } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, CircularProgress, Stepper, Step, StepLabel } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import LockResetIcon from '@mui/icons-material/LockReset'
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import { sendOTP, verifyOTP } from '../../services/mockOTP'

const STEPS = ['Nhập Email', 'Xác thực OTP', 'Mật khẩu mới']

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
    <div className="flex gap-2 justify-center">
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
          className="w-10 h-12 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all
            border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-gray-50"
        />
      ))}
    </div>
  )
}

interface ForgotPasswordProps {
  asModal?: boolean;
  onClose?: () => void;
  onNavigate?: (path: string) => void;
}

export default function ForgotPassword({ asModal = false, onNavigate }: ForgotPasswordProps) {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const go = (path: string) => {
    if (asModal && onNavigate) onNavigate(path)
    else navigate(path)
  }

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!email.includes('@')) {
      setError('Email không hợp lệ.')
      return
    }

    startTransition(async () => {
      // Simulate checking email and sending OTP using mockOTP service
      const result = await sendOTP('0901234567') // Mocking phone/email OTP
      if (result.success) {
        setSuccess(`Mã xác thực đã được gửi tới ${email}. (Mã mẫu: 123456)`)
        setActiveStep(1)
      } else {
        setError('Gửi yêu cầu thất bại. Thử lại sau.')
      }
    })
  }

  const handleStep2 = () => {
    setError('')
    setSuccess('')
    if (otpCode.length !== 6) {
      setError('Vui lòng nhập đủ 6 chữ số OTP.')
      return
    }

    startTransition(async () => {
      const result = await verifyOTP('0901234567', otpCode)
      if (result.success) {
        setSuccess('')
        setActiveStep(2)
      } else {
        setError(result.message)
      }
    })
  }

  const handleStep3 = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!newPassword || newPassword.length < 6) {
      setError('Mật khẩu ít nhất 6 ký tự.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }

    startTransition(async () => {
      await new Promise(r => setTimeout(r, 1000))
      // Mock success change password
      setActiveStep(3)
    })
  }

  const content = (
    <div className={`w-full max-w-md mx-auto ${asModal ? 'px-2' : ''}`}>
      {/* Back button */}
      {!asModal && (
        <button
          onClick={() => go('/auth/login')}
          className="flex items-center gap-1 text-gray-500 hover:text-red-600 mb-6 text-sm transition-colors bg-transparent border-none cursor-pointer p-0"
        >
          <ArrowBackIcon fontSize="small" /> Quay lại đăng nhập
        </button>
      )}

      {asModal && activeStep < 3 && (
        <button
          onClick={() => go('/auth/login')}
          className="flex items-center gap-1 text-gray-500 hover:text-red-600 mb-2 mt-2 text-xs font-bold transition-colors bg-transparent border-none cursor-pointer p-0"
        >
          <ArrowBackIcon fontSize="inherit" /> Quay lại
        </button>
      )}

      {/* Title */}
      <div className={`text-center ${asModal ? 'mb-4 mt-2' : 'mb-8'}`}>
        {activeStep < 3 && !asModal && (
          <div className="inline-flex w-14 h-14 bg-red-600 rounded-2xl items-center justify-center mb-4 shadow-xl">
            <LockResetIcon sx={{ color: 'white', fontSize: 32 }} />
          </div>
        )}
        <h1 className={`${asModal ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900`}>Khôi phục mật khẩu</h1>
        {activeStep < 3 && (
          <p className="text-gray-500 mt-1 text-sm">
            {activeStep === 0 && 'Chúng tôi sẽ gửi mã OTP qua email.'}
            {activeStep === 1 && 'Vui lòng kiểm tra hộp thư của bạn.'}
            {activeStep === 2 && 'Tạo một mật khẩu an toàn và dễ nhớ.'}
          </p>
        )}
      </div>

      <div className={`${!asModal ? 'bg-[#FFF7F7] rounded-3xl shadow-xl p-8 border border-rose-100' : 'p-2'}`}>

        {activeStep < 3 && (
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4, '& .MuiStepLabel-label': { fontSize: '0.65rem' } }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
        {success && <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}

        {/* STEP 1: Enter Email */}
        {activeStep === 0 && (
          <form onSubmit={handleStep1} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email liên kết với tài khoản</label>
              <div className="relative">
                <MarkEmailReadIcon sx={{ color: '#9CA3AF', position: 'absolute', top: 12, left: 14 }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition bg-white"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isPending || !email}
              className="w-full bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isPending ? <CircularProgress size={16} sx={{ color: 'white' }} /> : null}
              {isPending ? 'Đang gửi...' : 'Gửi mã OTP'}
            </button>
          </form>
        )}

        {/* STEP 2: Enter OTP */}
        {activeStep === 1 && (
          <div className="space-y-4 text-center">
            <OTPInput value={otpCode} onChange={setOtpCode} />
            <div className="text-xs text-gray-500 mt-2">
              Không nhận được mã? <button onClick={handleStep1} disabled={isPending} className="text-red-600 font-semibold hover:underline bg-transparent border-none cursor-pointer">Gửi lại</button>
            </div>
            <button
              onClick={handleStep2}
              disabled={isPending || otpCode.length !== 6}
              className="w-full bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isPending ? <CircularProgress size={16} sx={{ color: 'white' }} /> : null}
              {isPending ? 'Đang xác thực...' : 'Xác nhận OTP'}
            </button>
          </div>
        )}

        {/* STEP 3: New Password */}
        {activeStep === 2 && (
          <form onSubmit={handleStep3} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
              <div className="relative">
                <VpnKeyIcon sx={{ color: '#9CA3AF', position: 'absolute', top: 12, left: 14 }} />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
              <div className="relative">
                <VpnKeyIcon sx={{ color: '#9CA3AF', position: 'absolute', top: 12, left: 14 }} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition bg-white"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isPending || !newPassword || !confirmPassword}
              className="w-full bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isPending ? <CircularProgress size={16} sx={{ color: 'white' }} /> : null}
              {isPending ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </button>
          </form>
        )}

        {/* STEP 4: Success Message */}
        {activeStep === 3 && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Thành công!</h2>
            <p className="text-gray-500 text-sm">
              Mật khẩu của bạn đã được thay đổi.
            </p>
            <button
              onClick={() => go('/auth/login')}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all mt-4 border-none cursor-pointer"
            >
              Quay lại đăng nhập →
            </button>
          </div>
        )}

      </div>
    </div>
  )

  if (asModal) return content

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 flex items-center justify-center px-4 py-12">
      {content}
    </div>
  )
}
