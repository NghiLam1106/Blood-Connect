import { useNavigate } from 'react-router-dom'
import FavoriteIcon from '@mui/icons-material/Favorite'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import { useStore } from '../../store/useStore'

export function HeroSection() {
  const navigate = useNavigate()
  const { setAuthModalView } = useStore()
  return (
    <section className="relative pt-12 pb-20 overflow-hidden bg-background">
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side */}
        <div className="flex flex-col items-start z-10">
          <div className="inline-flex items-center gap-2 bg-red-50 text-primary px-4 py-2 rounded-full mb-8 font-semibold text-sm border border-red-100 shadow-sm">
            <span className="w-2 h-2 bg-primary rounded-full" />
            Hiện đang kết nối hiến máu bằng AI
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold text-dark leading-tight mb-6 tracking-tight">
            AI Kết Nối <br />
            <span className="text-primary tracking-tighter">Hiến Máu</span> <br />
            Trong Vài Phút
          </h1>

          <p className="text-gray-500 text-lg mb-10 max-w-lg leading-relaxed">
            RedBridge AI giúp kết nối người cần máu với người hiến phù hợp theo thời gian thực, đúng nhóm máu, đúng nơi, đúng lúc.
          </p>

          <div className="flex flex-wrap gap-4 mb-10">
            <button
              onClick={() => setAuthModalView('hospital')}
              className="flex items-center gap-2 bg-primary text-white font-bold py-3.5 px-8 rounded-xl hover:bg-red-600 transition-all shadow-lg hover:shadow-red-500/30"
            >
              <LocalHospitalIcon fontSize="small" />
              Yêu cầu máu
            </button>
            <button
              onClick={() => setAuthModalView('donor')}
              className="flex items-center gap-2 bg-accent text-white font-bold py-3.5 px-8 rounded-xl hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-500/30"
            >
              <FavoriteIcon fontSize="small" />
              Trở thành người hiến
            </button>
          </div>

          <p className="text-sm text-gray-500 flex items-center gap-2 font-medium">
            <span className="text-primary"><FavoriteIcon fontSize="small" /></span>
            Hơn 10.000+ người đã tham gia và cứu sống nhiều bệnh nhân
          </p>
        </div>

        {/* Right Side Illustration */}
        <div className="relative flex justify-center items-center h-[500px]">
          {/* Abstract Circle Background */}
          <div className="absolute w-[400px] h-[400px] bg-red-50/50 rounded-full flex items-center justify-center">
            <div className="w-[320px] h-[320px] bg-red-50/80 rounded-full flex items-center justify-center">
              <div className="w-[240px] h-[240px] bg-white rounded-full shadow-sm" />
            </div>
          </div>

          {/* Center Giant Blood Drop with Bridge inside (SVG approximation) */}
          <div className="relative z-10 w-56 h-72 flex flex-col items-center justify-end">
            <svg viewBox="0 0 100 130" className="w-full h-full drop-shadow-2xl">
              <defs>
                <linearGradient id="heroBlood" x1="50" y1="0" x2="50" y2="130" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FCA5A5" />
                  <stop offset="0.3" stopColor="#EF4444" />
                  <stop offset="1" stopColor="#991B1B" />
                </linearGradient>
              </defs>
              <path d="M50 0 C50 0 10 50 10 80 C10 102 28 120 50 120 C72 120 90 102 90 80 C90 50 50 0 50 0Z" fill="url(#heroBlood)" />
              {/* Bridge inside drop */}
              <path d="M25 85 C25 85 35 75 50 75 C65 75 75 85 75 85 M35 78 L35 105 M65 78 L65 105" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
              <path d="M45 76 L45 105 M55 76 L55 105" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
              <path d="M20 95 L80 95" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
            </svg>
          </div>

          {/* Floating Cards */}
          <div className="absolute top-24 left-0 lg:-left-12 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-4 animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '3s' }}>
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-2xl">👨🏻‍🦱</div>
            <div className="pr-2">
              <p className="font-bold text-sm text-dark">Người hiến</p>
              <p className="text-dark font-extrabold text-lg flex items-center gap-1">A+ <span className="w-4 h-4 bg-success rounded-full flex items-center justify-center text-white text-[10px] ml-1">✓</span></p>
            </div>
          </div>

          <div className="absolute bottom-24 right-0 lg:-right-8 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-4 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '4s' }}>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-2xl">👩🏻‍🦰</div>
            <div className="pr-2">
              <p className="font-bold text-sm text-dark">Bệnh nhân</p>
              <p className="text-dark font-extrabold text-lg flex items-center gap-1">A+ <FavoriteIcon sx={{ fontSize: 16 }} className="text-primary ml-1" /></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
