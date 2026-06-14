import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import {
  Alert,
  CircularProgress,
  Dialog,
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Step,
  StepLabel,
  Stepper,
} from '@mui/material'
import { useRef, useState, useTransition } from 'react'
import { useNavigate } from 'react-router-dom'
import { VietnamAddressField, type VietnamAddressValue } from '../../components/common/VietnamAddressField'
import { authService } from '../../services/auth.service'
import type { BloodType } from '../../store/useStore'
import { useStore } from '../../store/useStore'
import { storage } from '../../utils/localStorage'

const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const STEPS = ['Thông tin', 'Xác thực OTP', 'Hoàn tất']
const EMPTY_ADDRESS: VietnamAddressValue = {
  provinceCode: '',
  provinceName: '',
  wardCode: '',
  wardName: '',
  street: '',
}

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

interface RegisterProps {
  asModal?: boolean;
  onClose?: () => void;
  onNavigate?: (path: string) => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DonorRegister({ asModal = false, onClose, onNavigate }: RegisterProps) {
  const navigate = useNavigate()
  const login = useStore((s) => s.login)
  const [activeStep, setActiveStep] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpInfo, setOtpInfo] = useState('')
  const [pendingUser, setPendingUser] = useState<any>(null)

  const go = (path: string) => {
    if (asModal && onNavigate) onNavigate(path)
    else navigate(path)
  }

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    addressDetails: EMPTY_ADDRESS,
    bloodType: '' as BloodType | '',
    password: '',
    confirmPassword: '',
  })
  const [addressErrors, setAddressErrors] = useState({ province: '', ward: '' })

  const setField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleStep1 = () => {
    setError('')
    setAddressErrors({ province: '', ward: '' })
    if (!form.name || !form.email || !form.phone || !form.bloodType || !form.password) {
      setError('Vui lòng điền đầy đủ thông tin.')
      return
    }
    const nextAddressErrors = {
      province: form.addressDetails.provinceCode ? '' : 'Vui lòng chọn tỉnh/thành phố.',
      ward: form.addressDetails.wardCode ? '' : 'Vui lòng chọn xã/phường.',
    }
    if (nextAddressErrors.province || nextAddressErrors.ward) {
      setAddressErrors(nextAddressErrors)
      setError('Vui lòng hoàn tất thông tin địa chỉ.')
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
      try {
        const address = [
          form.addressDetails.street.trim(),
          form.addressDetails.wardName,
          form.addressDetails.provinceName,
        ]
          .filter(Boolean)
          .join(', ')
        const payload = {
          nameDonor: form.name,
          email: form.email,
          phone: form.phone,
          address,
          provinceName: form.addressDetails.provinceName,
          wardName: form.addressDetails.wardName,
          street: form.addressDetails.street.trim(),
          bloodType: form.bloodType,
          password: form.password,
          role: 'DONOR'
        }
        const result = await authService.registerDonor(payload)
        setOtpInfo(result.message)
        setActiveStep(1)
      } catch (err: any) {
        setError(err.message || 'Gửi yêu cầu đăng ký thất bại.')
      }
    })
  }

  const handleStep2 = () => {
    setError('')
    if (otpCode.length !== 6) {
      setError('Vui lòng nhập đủ 6 chữ số OTP.')
      return
    }

    startTransition(async () => {
      try {
        const result = await authService.verifyOtp(form.email, otpCode)
        const responseData = result.data;

        if (responseData?.accessToken) {
          storage.setToken(responseData.accessToken)
        }
        if (responseData?.refreshToken) {
          storage.setRefreshToken(responseData.refreshToken)
        }
        if (responseData?.user) {
          const userToSave = { ...responseData.user, role: 'donor' };
          setPendingUser(userToSave);
        }

        setActiveStep(2)
      } catch (err: any) {
        setError(err.message || 'Xác thực OTP thất bại.')
      }
    })
  }

  const content = (
    <div className={`w-full max-w-md mx-auto ${asModal ? 'px-2' : ''}`}>
      {/* Back button */}
      {!asModal && (
        <button
          onClick={() => go(-1 as any)}
          className="flex items-center gap-1 text-gray-500 hover:text-red-600 mb-6 text-sm transition-colors bg-transparent border-none cursor-pointer"
        >
          <ArrowBackIcon fontSize="small" /> Quay lại
        </button>
      )}

      {asModal && activeStep === 0 && (
        <button
          onClick={() => go('/auth')}
          className="flex items-center gap-1 text-gray-500 hover:text-red-600 mb-2 mt-2 text-xs font-bold transition-colors bg-transparent border-none cursor-pointer p-0"
        >
          <ArrowBackIcon fontSize="inherit" /> Đổi vai trò
        </button>
      )}

      <div className={`${!asModal ? 'bg-[#FFF7F7] rounded-3xl shadow-xl p-8 border border-rose-100' : ''}`}>
        {/* Logo */}
        <div className={`text-center ${asModal ? 'mb-4' : 'mb-6'}`}>
          {!asModal && (
            <div className="inline-flex w-12 h-12 bg-red-600 rounded-xl items-center justify-center mb-3">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
                <path d="M12 2.4C9.3 6.1 6 9.5 6 13.5A6 6 0 1 0 18 13.5C18 9.5 14.7 6.1 12 2.4z" />
              </svg>
            </div>
          )}
          <h1 className={`${asModal ? 'text-xl' : 'text-2xl'} font-bold text-gray-900`}>Đăng ký hiến máu</h1>
        </div>

        {/* MUI Stepper */}
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: asModal ? 3 : 4 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel sx={{ '& .MuiStepLabel-label': { fontSize: '0.65rem' } }}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        {/* ─── Step 0: Personal Info ─── */}
        {activeStep === 0 && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Họ và tên *</label>
              <input
                type="text"
                value={form.name}
                onChange={setField('name')}
                placeholder="Nguyễn Văn An"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={setField('email')}
                  placeholder="example@email.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Số đthoại *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={setField('phone')}
                  placeholder="0901234567"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition"
                />
              </div>
            </div>
            <VietnamAddressField
              value={form.addressDetails}
              errors={addressErrors}
              onChange={(nextAddress) => {
                setAddressErrors({ province: '', ward: '' })
                setForm((prev) => ({ ...prev, addressDetails: nextAddress }))
              }}
            />
            <FormControl fullWidth size="small" sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#DC2626',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#DC2626',
              },
            }}>
              <InputLabel sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Nhóm máu *</InputLabel>
              <Select
                value={form.bloodType}
                label="Nhóm máu *"
                onChange={(e) => setForm((p) => ({ ...p, bloodType: e.target.value as BloodType }))}
              >
                {BLOOD_TYPES.map((bt) => (
                  <MenuItem key={bt} value={bt}>{bt}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mật khẩu *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={setField('password')}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Xác nhận MK *</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={setField('confirmPassword')}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition"
                />
              </div>
            </div>
            <button
              onClick={handleStep1}
              disabled={isPending}
              className="w-full bg-red-600 mt-2 hover:bg-red-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {isPending ? <CircularProgress size={16} sx={{ color: 'white' }} /> : null}
              {isPending ? 'Đang gửi OTP...' : 'Tiếp theo →'}
            </button>
          </div>
        )}

        {/* ─── Step 1: OTP ─── */}
        {activeStep >= 1 && (
          <div className="space-y-4 text-center">
            {/* <div className="bg-blue-50 rounded-2xl p-3 text-xs font-semibold text-blue-700">{otpInfo}</div> */}
            {/* <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
              💡 Dev mode: Nhập <strong>123456</strong> để xác thực.
            </div> */}
            <OTPInput value={otpCode} onChange={setOtpCode} />
            <button
              onClick={handleStep2}
              disabled={isPending || otpCode.length !== 6}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isPending ? <CircularProgress size={16} sx={{ color: 'white' }} /> : null}
              {isPending ? 'Đang xác thực...' : 'Xác nhận OTP'}
            </button>
            <button
              onClick={() => { setOtpCode(''); handleStep1() }}
              className="text-sm font-semibold text-red-600 hover:underline bg-transparent border-none cursor-pointer"
            >
              Gửi lại OTP
            </button>
          </div>
        )}

        {/* ─── Step 2: Success Popup ─── */}
        <Dialog
          open={activeStep === 2}
          onClose={() => {}}
          PaperProps={{
            style: { borderRadius: 24, padding: 8 }
          }}
        >
          <DialogContent className="text-center py-8 px-10 max-w-sm">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-sm mb-5">
              <span className="text-4xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Đăng ký thành công!</h2>
            <p className="text-gray-500 text-sm mb-8">
              Chào mừng <strong>{form.name}</strong>. Tài khoản của bạn đã được xác thực thành công. Hãy vào Dashboard để cập nhật trạng thái.
            </p>
            <button
              onClick={() => {
                if (pendingUser) login(pendingUser)
                if (onClose) onClose()
                navigate('/donor/dashboard')
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm"
            >
              Đến Dashboard →
            </button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )

  if (asModal) return content;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 flex items-center justify-center px-4 py-12">
      {content}
    </div>
  )
}
