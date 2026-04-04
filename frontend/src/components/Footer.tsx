
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="currentColor">
                  <path d="M12 2.4C9.3 6.1 6 9.5 6 13.5A6 6 0 1 0 18 13.5C18 9.5 14.7 6.1 12 2.4z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">BloodConnect</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Kết nối người hiến máu và bệnh viện thông qua công nghệ AI tiên tiến, cứu sống nhiều sinh mạng hơn mỗi ngày.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Điều hướng</h3>
            <ul className="space-y-2">
              {['Về chúng tôi', 'Quy trình hiến máu', 'Hỏi đáp', 'Kiến thức'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-400 hover:text-red-400 transition-colors no-underline">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* For Donors */}
          <div>
            <h3 className="text-white font-semibold mb-4">Người hiến máu</h3>
            <ul className="space-y-2">
              <li><Link to="/auth/register/donor" className="text-sm text-gray-400 hover:text-red-400 transition-colors no-underline">Đăng ký hiến máu</Link></li>
              <li><Link to="/auth/login" className="text-sm text-gray-400 hover:text-red-400 transition-colors no-underline">Đăng nhập</Link></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-red-400 transition-colors no-underline">Lịch sử hiến máu</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-red-400 transition-colors no-underline">Nhận thông báo</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📞 1800-1234 (Miễn phí)</li>
              <li>✉️ support@bloodconnect.vn</li>
              <li>📍 Đà Nẵng, Việt Nam</li>
              <li className="flex gap-3 mt-3">
                <a href="#" className="text-gray-400 hover:text-red-400 transition-colors text-lg">📘</a>
                <a href="#" className="text-gray-400 hover:text-red-400 transition-colors text-lg">🐦</a>
                <a href="#" className="text-gray-400 hover:text-red-400 transition-colors text-lg">📸</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-sm text-gray-500">© 2026 BloodConnect. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="text-sm text-gray-500 hover:text-gray-300 no-underline">Chính sách bảo mật</a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-300 no-underline">Điều khoản sử dụng</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
