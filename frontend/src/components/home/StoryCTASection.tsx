import { useStore } from '../../store/useStore'

export function StoryCTASection() {
  const { setAuthModalView } = useStore()
  return (
    <section className="py-12 bg-background pb-24">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {/* Story */}
        <div className="col-span-1 border-l-4 border-primary pl-8 py-4 flex flex-col justify-center">
          <h3 className="font-extrabold text-primary text-xl mb-4">Câu chuyện<br />truyền cảm hứng</h3>
          <p className="italic text-gray-600 text-sm mb-4 leading-relaxed relative">
            <span className="text-4xl text-gray-200 absolute -top-4 -left-2 tracking-tighter">"</span>
            Nhờ RedBridge AI, tôi đã tìm được người hiến máu phù hợp chỉ trong 20 phút. Nền tảng thật sự tuyệt vời!
          </p>
          <p className="text-xs font-bold text-dark">— Bệnh nhân chợ Rẫy</p>
        </div>
        {/* Rating */}
        <div className="col-span-1 bg-white rounded-3xl p-8 border border-red-50 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="text-5xl font-extrabold text-primary mb-2">20 <span className="text-xl">phút</span></div>
          <p className="text-sm font-semibold text-gray-500">Thời gian kết nối trung bình</p>
        </div>
        <div className="col-span-1 grid grid-rows-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-red-50 flex flex-col items-center justify-center shadow-sm">
            <div className="text-3xl font-extrabold text-secondary mb-1">4.9<span className="text-lg">/5</span></div>
            <div className="flex text-yellow-400 text-sm mb-2">★★★★★</div>
            <p className="text-xs font-bold text-gray-500">Đánh giá từ người dùng</p>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-red-50 flex flex-col items-center justify-center shadow-sm">
            <div className="text-3xl font-extrabold text-dark mb-1">1000+</div>
            <p className="text-xs font-bold text-gray-500">Lượt kết nối mỗi ngày</p>
          </div>
        </div>
      </div>

      {/* Banner CTA */}
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-primary to-orange-500 rounded-3xl p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between text-white relative overflow-hidden shadow-2xl">
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-400 opacity-30 rounded-full blur-3xl"></div>

          <div className="relative z-10 text-center md:text-left mb-8 md:mb-0">
            <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">Bạn có thể trở thành người hùng</h2>
            <p className="font-medium opacity-90 text-red-50 max-w-lg text-sm lg:text-base leading-relaxed">Mỗi giọt máu cho đi, một cuộc đời ở lại. Trở thành người hiến và cứu sống những bệnh nhân đang cần bạn.</p>
          </div>

          <button onClick={() => setAuthModalView('donor')} className="relative z-10 bg-white text-primary font-bold px-8 py-4 rounded-2xl hover:scale-105 transition-all shadow-xl text-base flex items-center justify-center gap-2 whitespace-nowrap">
            ❤️ Đăng ký ngay
          </button>
        </div>
      </div>
    </section>
  )
}
