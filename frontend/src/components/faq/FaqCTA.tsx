import { useNavigate } from 'react-router-dom'

export function FaqCTA() {
  const navigate = useNavigate()
  return (
    <div className="max-w-3xl mx-auto mt-12 bg-red-50 rounded-3xl p-8 text-center border border-red-100 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="text-left">
        <h3 className="text-xl font-extrabold text-dark mb-2">Đã sẵn sàng tạo khác biệt?</h3>
        <p className="text-gray-600 text-sm">Hiến máu là hành động cao đẹp và cực kỳ an toàn. Đăng ký ngay để nhận thông báo khi có người cần.</p>
      </div>
      <button
        onClick={() => navigate('/auth/register/donor')}
        className="bg-primary text-white font-bold px-8 py-3.5 rounded-xl hover:bg-red-600 transition-all shadow-lg hover:shadow-red-500/30 whitespace-nowrap"
      >
        Đăng ký hiến máu
      </button>
    </div>
  )
}
