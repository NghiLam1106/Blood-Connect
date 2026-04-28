import { useMemo, useState, useTransition } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, CircularProgress, Tab, Tabs } from '@mui/material'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import { useStore } from '../../store/useStore'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'


// Demo accounts for quick login
const DEMO_ACCOUNTS = {
  donor: {
    email: 'nguyen.van.an@demo.com',
    password: 'demo123',
    user: {
      id: 'demo-donor-1',
      name: 'Nguyễn Văn An',
      email: 'nguyen.van.an@demo.com',
      phone: '0901234567',
      role: 'donor' as const,
      bloodType: 'O+' as const,
      totalDonations: 5,
      lastDonation: '2025-01-15',
    },
  },
  hospital: {
    email: 'admin@bachmai.vn',
    password: 'demo123',
    user: {
      id: 'demo-hospital-1',
      name: 'Bệnh viện Bạch Mai',
      email: 'admin@bachmai.vn',
      phone: '02438574341',
      role: 'hospital' as const,
    },
  },
}

interface LoginProps {
  asModal?: boolean;
  onClose?: () => void;
  onNavigate?: (path: string) => void;
}

export default function Login({ asModal = false, onClose, onNavigate }: LoginProps) {
  const navigate = useNavigate()
  const login = useStore((s) => s.login)
  const [tab, setTab] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })

  const currentRole = tab === 0 ? 'donor' : 'hospital'

  const canSubmit = useMemo(
    () => form.email.trim() !== '' && form.password.trim() !== '',
    [form.email, form.password]
  )

  const go = (path: string) => {
    if (asModal && onNavigate) onNavigate(path)
    else navigate(path)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    startTransition(async () => {
      await new Promise((r) => setTimeout(r, 1000))

      const demo = DEMO_ACCOUNTS[currentRole]
      if (form.email === demo.email && form.password === demo.password) {
        login(demo.user)
        if (onClose) onClose()
        if (currentRole === 'donor') navigate('/donor/dashboard')
        else navigate('/hospital/dashboard')
      } else {
        setError('Email hoặc mật khẩu không đúng. Thử dùng tài khoản demo.')
      }
    })
  }

  const fillDemo = () => {
    const demo = DEMO_ACCOUNTS[currentRole]
    setForm({ email: demo.email, password: demo.password })
    setError('')
  }

  const content = (
    <div className={`w-full max-w-md mx-auto ${asModal ? 'p-2' : ''}`}>
      {/* Back button */}
      {!asModal && (
        <button
          onClick={() => go(-1 as any)}
          className="flex items-center gap-1 text-gray-500 hover:text-red-600 mb-6 text-sm transition-colors bg-transparent border-none cursor-pointer"
        >
          <ArrowBackIcon fontSize="small" /> Quay lại
        </button>
      )}
      <div className={`text-center ${asModal ? 'mb-6 mt-4' : 'mb-8'}`}>
        {!asModal && (
          <div className="inline-flex w-14 h-14 bg-red-600 rounded-2xl items-center justify-center mb-4 shadow-xl">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="currentColor">
              <path d="M12 2.4C9.3 6.1 6 9.5 6 13.5A6 6 0 1 0 18 13.5C18 9.5 14.7 6.1 12 2.4z" />
            </svg>
          </div>
        )}
        <h1 className={`${asModal ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900`}>Đăng nhập</h1>
        <p className="text-gray-500 mt-1">Chào mừng bạn quay trở lại!</p>
      </div>

      <div className={`${!asModal ? 'bg-[#FFF7F7] rounded-3xl shadow-xl p-8 border border-rose-100' : 'p-2'}`}>
        {/* Role Tabs */}
        <Tabs
          value={tab}
          onChange={(_, v) => { setTab(v); setError(''); setForm({ email: '', password: '' }) }}
          variant="fullWidth"
          sx={{
            mb: 3,
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, borderRadius: 2, minHeight: 40 },
            '& .MuiTabs-indicator': { backgroundColor: '#dc2626' },
          }}
        >
          <Tab icon={<PersonOutlineIcon fontSize="small" />} iconPosition="start" label="Người hiến máu" />
          <Tab icon={<LocalHospitalIcon fontSize="small" />} iconPosition="start" label="Bệnh viện" />
        </Tabs>

        {/* Demo hint */}
        {/* <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
          <p className="text-xs text-amber-700 mb-1.5">
            💡 <strong>Tài khoản demo:</strong> {DEMO_ACCOUNTS[currentRole].email}
          </p>
          <button
            onClick={fillDemo}
            className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1 rounded-lg font-medium transition cursor-pointer border-none"
          >
            Điền tự động →
          </button>
        </div> */}

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder={DEMO_ACCOUNTS[currentRole].email}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => go('/auth/forgot-password')}
              className="text-xs text-red-600 hover:underline bg-transparent border-none cursor-pointer"
            >
              Quên mật khẩu?
            </button>
          </div>

          <button
            type="submit"
            disabled={!canSubmit || isPending}
            className="w-full bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {isPending ? <CircularProgress size={16} sx={{ color: 'white' }} /> : null}
            {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-5">
          Chưa có tài khoản?{' '}
          <button
            onClick={() => go('/auth')}
            className="text-red-600 font-semibold hover:underline bg-transparent border-none cursor-pointer"
          >
            Đăng ký ngay
          </button>
        </p>
      </div>
    </div>
  )

  if (asModal) {
    return content;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 flex items-center justify-center px-4 py-12">
      {content}
    </div>
  )
}
