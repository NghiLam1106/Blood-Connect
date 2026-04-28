import { useNavigate } from 'react-router-dom'
import FavoriteIcon from '@mui/icons-material/Favorite'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

interface AuthSelectProps {
  asModal?: boolean;
  onClose?: () => void;
  onNavigate?: (path: string) => void;
}

export default function AuthSelect({ asModal = false, onNavigate }: AuthSelectProps) {
  const navigate = useNavigate()

  const go = (path: string) => {
    if (asModal && onNavigate) onNavigate(path)
    else navigate(path)
  }

  const content = (
    <div className={`w-full max-w-2xl mx-auto ${asModal ? 'py-4' : ''}`}>
      {/* Back button */}
      {!asModal && (
        <div className="mb-6">
          <button
            onClick={() => go("/home")}
            className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 bg-transparent border-none cursor-pointer p-0"
          >
            ← Quay lại
          </button>
        </div>
      )}

      {/* Header */}
      <div className={`text-center ${asModal ? 'mb-8 mt-2' : 'mb-12'}`}>
        {!asModal && (
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-2xl shadow-xl mb-4">
            <svg viewBox="0 0 24 24" className="h-8 w-8 text-white" fill="currentColor">
              <path d="M12 2.4C9.3 6.1 6 9.5 6 13.5A6 6 0 1 0 18 13.5C18 9.5 14.7 6.1 12 2.4z" />
            </svg>
          </div>
        )}
        <h1 className={`${asModal ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900 mb-2`}>Tham gia RedBridge AI</h1>
        <p className="text-gray-500 text-base">Bạn muốn đăng ký với tư cách nào?</p>
      </div>

      {/* Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Individual Card */}
        <button
          onClick={() => go('/auth/register/donor')}
          className="group relative bg-white hover:bg-[#FEF2F280] rounded-3xl p-6 shadow-md border border-gray-100 hover:border-red-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left cursor-pointer"
        >
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowForwardIcon sx={{ color: '#dc2626' }} />
          </div>
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-red-600 transition-colors duration-300">
            <FavoriteIcon sx={{ fontSize: 24, color: '#dc2626' }} className="group-hover:!text-white transition-colors duration-300" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Cá nhân</h2>
          <p className="text-gray-500 text-xs leading-relaxed mb-4">
            Đăng ký làm người hiến máu tình nguyện. Nhận thông báo khi bệnh viện cần nhóm máu của bạn.
          </p>
          <div className="flex flex-wrap gap-2">
            {['Hiến máu', 'Thông báo'].map((tag) => (
              <span key={tag} className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-1 rounded-full">{tag}</span>
            ))}
          </div>
        </button>

        {/* Organization Card */}
        <button
          onClick={() => go('/auth/register/hospital')}
          className="group relative bg-white hover:bg-[#FEF2F280] rounded-3xl p-6 shadow-md border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left cursor-pointer"
        >
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowForwardIcon sx={{ color: '#2563eb' }} />
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors duration-300">
            <LocalHospitalIcon sx={{ fontSize: 24, color: '#2563eb' }} className="group-hover:!text-white transition-colors duration-300" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Tổ chức y tế</h2>
          <p className="text-gray-500 text-xs leading-relaxed mb-4">
            Đăng ký cho bệnh viện / cơ sở y tế. Tìm kiếm người hiến máu khẩn cấp bằng hệ thống lõi AI.
          </p>
          <div className="flex flex-wrap gap-2">
            {['AI Matching', 'Dashboard'].map((tag) => (
              <span key={tag} className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{tag}</span>
            ))}
          </div>
        </button>
      </div>

      {/* Login link */}
      <p className="text-center mt-6 text-sm text-gray-600">
        Đã có tài khoản?{' '}
        <button onClick={() => go('/auth/login')} className="text-red-600 font-semibold hover:underline bg-transparent border-none cursor-pointer">
          Đăng nhập ngay
        </button>
      </p>
    </div>
  )

  if (asModal) return content;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center px-4 py-12">
      {content}
    </div>
  )
}
