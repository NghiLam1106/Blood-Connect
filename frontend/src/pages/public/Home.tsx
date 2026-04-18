import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Stepper,
  Step,
  StepLabel,
  Paper,
  Typography,
  Chip,
} from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '', duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const steps = 60
        const increment = target / steps
        let current = 0
        const timer = setInterval(() => {
          current += increment
          if (current >= target) {
            setCount(target)
            clearInterval(timer)
          } else {
            setCount(Math.floor(current))
          }
        }, duration / steps)
      }
    }, { threshold: 0.5 })

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-bold text-white">
      {count.toLocaleString('vi-VN')}{suffix}
    </div>
  )
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection() {
  const navigate = useNavigate()

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-red-700 via-red-600 to-rose-500">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-red-400 opacity-20 blur-3xl" />
        <div className="absolute bottom-0 -left-32 w-[400px] h-[400px] rounded-full bg-rose-300 opacity-20 blur-3xl" />
        <svg className="absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path d="M0,80 L1440,80 L1440,20 Q720,80 0,20 Z" fill="white" />
        </svg>
      </div>

      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 py-24">
        {/* Left content */}
        <div className="text-white">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Hệ thống hoạt động 24/7</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
            Một giọt máu<br />
            <span className="text-yellow-300">Triệu cuộc đời</span>
          </h1>

          <p className="text-lg md:text-xl text-red-100 mb-8 max-w-lg leading-relaxed">
            BloodConnect kết nối người hiến máu tình nguyện với các bệnh viện trong vòng <strong className="text-yellow-300">phút</strong> bằng AI. Mỗi lần hiến là một cuộc sống được cứu.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/auth/register/donor')}
              className="flex items-center justify-center gap-2 bg-white text-red-600 font-bold text-base px-8 py-4 rounded-xl shadow-xl hover:bg-red-50 hover:scale-105 transition-all duration-200"
            >
              <FavoriteIcon fontSize="small" />
              Tôi muốn hiến máu
            </button>
            <button
              onClick={() => navigate('/auth/register/hospital')}
              className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white font-bold px-10 py-4 rounded-xl text-base hover:scale-105 transition-all duration-200 border border-white/30 flex items-center justify-center gap-2"
            >
              <LocalHospitalIcon fontSize="small" />
              Dành cho Bệnh viện
            </button>
          </div>

          <div className="flex items-center gap-6 mt-10 pt-8 border-t border-white/20">
            <div className="text-center">
              <div className="text-2xl font-bold">50+</div>
              <div className="text-xs text-red-200">Bệnh viện</div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold">12,000+</div>
              <div className="text-xs text-red-200">Người hiến</div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold">99%</div>
              <div className="text-xs text-red-200">Kết nối thành công</div>
            </div>
          </div>
        </div>

        {/* Right illustration */}
        <div className="hidden lg:flex justify-center items-center">
          <div className="relative">
            <div className="w-80 h-80 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/20">
              <svg viewBox="0 0 200 200" className="w-64 h-64">
                {/* Central heart */}
                <path d="M100 155 C60 130 20 100 20 65 C20 40 40 25 65 25 C80 25 93 32 100 42 C107 32 120 25 135 25 C160 25 180 40 180 65 C180 100 140 130 100 155Z" fill="white" opacity="0.9" />
                {/* Cross */}
                <path d="M88 55 L88 100 M70 73 L106 73" stroke="#dc2626" strokeWidth="8" strokeLinecap="round" />
                {/* Pulse line */}
                <path d="M30 145 L55 145 L65 125 L75 165 L85 135 L95 145 L170 145" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
              </svg>
            </div>
            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-white rounded-xl px-3 py-2 shadow-lg text-xs font-bold text-red-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              AI Đang hoạt động
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl px-3 py-2 shadow-lg text-xs font-bold text-blue-600">
              📍 Bán kính 5km
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Stats Section ────────────────────────────────────────────────────────────
function StatsSection() {
  const stats = [
    { label: 'Ca cấp cứu thành công', value: 8520, suffix: '+', icon: '🏥' },
    { label: 'Người hiến sẵn sàng', value: 12480, suffix: '+', icon: '💪' },
    { label: 'Phút phản hồi trung bình', value: 8, suffix: ' phút', icon: '⚡' },
    { label: 'Bệnh viện đối tác', value: 58, suffix: '+', icon: '🏨' },
  ]

  return (
    <section className="bg-gradient-to-r from-red-600 to-rose-600 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <Chip label="Số liệu thực tế" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', mb: 2 }} />
          <h2 className="text-3xl font-bold text-white">Tác động của chúng tôi</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              <p className="text-red-100 text-sm mt-2 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Process Section (MUI Stepper) ────────────────────────────────────────────
function ProcessSection() {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      label: 'Bệnh viện yêu cầu',
      icon: <LocalHospitalIcon />,
      color: '#2563eb',
      description: 'Bệnh viện nhập nhóm máu cần thiết, số lượng và mức độ khẩn cấp vào hệ thống. AI sẽ nhận lệnh trong vòng 1 giây.',
      detail: 'Nhóm máu • Số lượng • Độ khẩn cấp 1-5 • Bệnh viện tự động xác thực',
    },
    {
      label: 'AI Matching',
      icon: <AutoAwesomeIcon />,
      color: '#7c3aed',
      description: 'Thuật toán AI quét toàn bộ danh sách người hiến trong bán kính 5km, phân tích nhóm máu, lịch sử hiến và độ ưu tiên địa lý.',
      detail: 'Phân tích < 2 giây • Ưu tiên khoảng cách • Kiểm tra lịch sử • Top 10 kết quả',
    },
    {
      label: 'Kết nối & Cứu người',
      icon: <VolunteerActivismIcon />,
      color: '#16a34a',
      description: 'Người hiến nhận thông báo khẩn cấp ngay lập tức trên điện thoại. Một click xác nhận, bắt đầu hành trình cứu người.',
      detail: 'Thông báo tức thì • Google Maps tích hợp • Theo dõi real-time • Xác nhận đến nơi',
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length)
    }, 9000)
    return () => clearInterval(interval)
  }, [steps.length])

  return (
    <section id="process" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <Chip label="Quy trình AI" color="error" sx={{ mb: 2 }} />
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Hoạt động như thế nào?</h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Từ yêu cầu đến kết nối, chỉ mất vài phút nhờ công nghệ AI tiên tiến.
          </p>
        </div>

        {/* Desktop: Horizontal Stepper */}
        <div className="hidden md:block max-w-4xl mx-auto mb-12">
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={step.label} onClick={() => setActiveStep(index)} sx={{ cursor: 'pointer' }}>
                <StepLabel
                  StepIconComponent={() => (
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300"
                      style={{
                        backgroundColor: activeStep === index ? step.color : '#d1d5db',
                        transform: activeStep === index ? 'scale(1.2)' : 'scale(1)',
                      }}
                    >
                      {step.icon}
                    </div>
                  )}
                >
                  <span className={`font-semibold ${activeStep === index ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </div>

        {/* Active Step Detail */}
        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={step.label}
              className={`transition-all duration-500 ${activeStep === index ? 'block' : 'hidden'}`}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  border: `2px solid ${step.color}20`,
                  background: `linear-gradient(135deg, ${step.color}08 0%, white 100%)`,
                }}
              >
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                    style={{ backgroundColor: step.color }}
                  >
                    <span className="text-white scale-150">{step.icon}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Typography variant="h5" fontWeight={700}>{step.label}</Typography>
                      <Chip label={`Bước ${index + 1}/3`} size="small" sx={{ bgcolor: `${step.color}20`, color: step.color }} />
                    </div>
                    <Typography color="text.secondary" sx={{ mb: 2, fontSize: '1rem' }}>
                      {step.description}
                    </Typography>
                    <div className="flex flex-wrap gap-2">
                      {step.detail.split(' • ').map((item) => (
                        <span key={item} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Paper>
            </div>
          ))}
        </div>

        {/* Dot navigation */}
        <div className="flex justify-center gap-2 mt-6">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveStep(i)}
              className={`rounded-full transition-all duration-300 ${activeStep === i ? 'w-6 h-3 bg-red-600' : 'w-3 h-3 bg-gray-300'}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Blood Types Section ──────────────────────────────────────────────────────
function BloodTypesSection() {
  const types = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 text-center">
        <Chip label="Tất cả nhóm máu" color="error" sx={{ mb: 2 }} />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Hỗ trợ mọi nhóm máu</h2>
        <p className="text-gray-500 mb-10">Hệ thống AI của chúng tôi hỗ trợ đầy đủ 8 nhóm máu ABO/Rh</p>
        <div className="flex flex-wrap justify-center gap-4">
          {types.map((type) => (
            <div
              key={type}
              className="w-20 h-20 rounded-2xl bg-white border-2 border-red-100 shadow-md flex flex-col items-center justify-center hover:border-red-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-red-500 mb-1" fill="currentColor">
                <path d="M12 2.4C9.3 6.1 6 9.5 6 13.5A6 6 0 1 0 18 13.5C18 9.5 14.7 6.1 12 2.4z" />
              </svg>
              <span className="font-bold text-gray-800 text-sm">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA Banner ────────────────────────────────────────────────────────────────
function CTABanner() {
  const navigate = useNavigate()

  return (
    <section className="py-20 bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white opacity-5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-rose-300 opacity-10 blur-3xl" />
      </div>
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-2 border-white/30 animate-pulse">
            <NotificationsActiveIcon sx={{ fontSize: 32, color: 'red' }} />
          </div>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Sẵn sàng cứu một cuộc đời?</h2>
        <p className="text-red-100 text-lg mb-8 max-w-xl mx-auto">
          Đăng ký ngay hôm nay và trở thành một phần của cộng đồng 12,000+ người hiến máu tại Việt Nam.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/auth/register/donor')}
            className="bg-white text-red-600 font-bold px-10 py-4 rounded-xl text-base hover:bg-red-50 hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
          >
            ❤️ Đăng ký hiến máu
          </button>
          <button
            onClick={() => navigate('/auth/register/hospital')}
            className="bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white font-bold px-10 py-4 rounded-xl text-base hover:scale-105 transition-all duration-200 border border-white/30 flex items-center justify-center gap-2"
          >
            🏥 Đăng ký Bệnh viện
          </button>
        </div>
      </div>
    </section>
  )
}

// ─── Main Home Page ───────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <ProcessSection />
      <BloodTypesSection />
      <CTABanner />
    </>
  )
}
