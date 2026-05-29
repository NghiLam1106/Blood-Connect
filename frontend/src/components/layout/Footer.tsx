import { Link } from 'react-router-dom'
import { Logo } from './Logo'
import { useStore } from '../../store/useStore'

export function Footer() {
  const { isAuthenticated, user } = useStore()

  const getAccountLink = () => {
    if (!isAuthenticated || !user) return '/auth/login'
    const role = user.role.toLowerCase()
    if (role === 'donor') return '/donor/profile'
    if (role === 'hospital') return '/hospital/dashboard'
    if (role === 'admin') return '/admin/dashboard'
    return '/auth/login'
  }

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Logo />
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs mt-4">
              Kết nối người hiến máu và bệnh viện thông qua công nghệ AI tiên tiến, cứu sống nhiều sinh mạng hơn mỗi ngày.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 font-bold mb-4 uppercase text-sm tracking-wider">Hệ sinh thái</h3>
            <ul className="space-y-3">
              {[
                { label: 'Về chúng tôi', href: '/' },
                { label: 'Tính năng', href: '/#features' },
                { label: 'Quy trình AI', href: '/#process' },
                { label: 'Hỗ trợ', href: '/faq' }
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="text-sm border-b border-transparent text-gray-500 hover:text-primary transition-colors no-underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Donors */}
          <div>
            <h3 className="text-gray-900 font-bold mb-4 uppercase text-sm tracking-wider">Dành cho bạn</h3>
            <ul className="space-y-3">
              <li><Link to="/auth/register/donor" className="text-sm text-gray-500 hover:text-primary transition-colors no-underline">Đăng ký hiến máu</Link></li>
              <li><Link to="/knowledge" className="text-sm text-gray-500 hover:text-primary transition-colors no-underline">Kiến thức chung</Link></li>
              <li><Link to="/faq" className="text-sm text-gray-500 hover:text-primary transition-colors no-underline">Hỏi đáp thường gặp</Link></li>
              <li><Link to={getAccountLink()} className="text-sm text-gray-500 hover:text-primary transition-colors no-underline">Tài khoản</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-gray-900 font-bold mb-4 uppercase text-sm tracking-wider">Liên hệ</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <span className="text-primary font-bold">📞</span> 1800-1234 (Miễn phí)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary font-bold">✉️</span> support@redbridge.ai
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary font-bold">📍</span> Đà Nẵng, Việt Nam
              </li>
              <li className="flex gap-4 mt-6">
                <a href="#" className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all">📘</a>
                <a href="#" className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all">🐦</a>
                <a href="#" className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all">📸</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">© 2026 RedBridge AI. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-sm text-gray-400 hover:text-gray-600 no-underline">Chính sách bảo mật</Link>
            <Link to="/terms" className="text-sm text-gray-400 hover:text-gray-600 no-underline">Điều khoản</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
