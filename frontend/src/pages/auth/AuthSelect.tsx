import { useNavigate } from 'react-router-dom'
import FavoriteIcon from '@mui/icons-material/Favorite'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

export default function AuthSelect() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Back button */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/home")}
            className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
          >
            ← Quay lại
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-2xl shadow-xl mb-4">
            <svg viewBox="0 0 24 24" className="h-8 w-8 text-white" fill="currentColor">
              <path d="M12 2.4C9.3 6.1 6 9.5 6 13.5A6 6 0 1 0 18 13.5C18 9.5 14.7 6.1 12 2.4z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tham gia BloodConnect</h1>
          <p className="text-gray-500 text-lg">Bạn muốn đăng ký với tư cách nào?</p>
        </div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Individual Card */}
          <button
            onClick={() => navigate('/auth/register/donor')}
            className="group relative bg-white rounded-3xl p-8 shadow-lg border-2 border-transparent hover:border-red-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-left"
          >
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowForwardIcon sx={{ color: '#dc2626' }} />
            </div>
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-red-600 transition-colors duration-300">
              <FavoriteIcon sx={{ fontSize: 28, color: '#dc2626' }} className="group-hover:!text-white transition-colors duration-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Cá nhân</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Đăng ký làm người hiến máu tình nguyện. Nhận thông báo khi bệnh viện cần nhóm máu của bạn.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Hiến máu', 'Nhận thông báo', 'Theo dõi lịch sử'].map((tag) => (
                <span key={tag} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full">{tag}</span>
              ))}
            </div>
            <div className="mt-5 w-full bg-red-600 text-white text-sm font-semibold py-3 rounded-xl text-center group-hover:bg-red-700 transition-colors">
              Đăng ký ngay
            </div>
          </button>

          {/* Organization Card */}
          <button
            onClick={() => navigate('/auth/register/hospital')}
            className="group relative bg-white rounded-3xl p-8 shadow-lg border-2 border-transparent hover:border-blue-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-left"
          >
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowForwardIcon sx={{ color: '#2563eb' }} />
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-blue-600 transition-colors duration-300">
              <LocalHospitalIcon sx={{ fontSize: 28, color: '#2563eb' }} className="group-hover:!text-white transition-colors duration-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Tổ chức y tế</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Đăng ký cho bệnh viện / cơ sở y tế. Tìm kiếm người hiến máu khẩn cấp bằng AI trong vài phút.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Tìm người hiến', 'AI Matching', 'Dashboard quản lý'].map((tag) => (
                <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{tag}</span>
              ))}
            </div>
            <div className="mt-5 w-full bg-blue-600 text-white text-sm font-semibold py-3 rounded-xl text-center group-hover:bg-blue-700 transition-colors">
              Đăng ký Bệnh viện
            </div>
          </button>
        </div>

        {/* Login link */}
        <p className="text-center mt-8 text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <button onClick={() => navigate('/auth/login')} className="text-red-600 font-semibold hover:underline bg-transparent border-none cursor-pointer">
            Đăng nhập ngay
          </button>
        </p>
      </div>
    </div>
  )
}
