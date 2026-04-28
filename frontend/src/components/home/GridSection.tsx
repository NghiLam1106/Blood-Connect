import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import FavoriteIcon from '@mui/icons-material/Favorite'

export function GridSection() {
  const types = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4 grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Blood Types */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 border border-red-50 shadow-[0_4px_20px_-4px_rgba(239,68,68,0.05)]">
          <h3 className="text-xs font-bold text-primary tracking-widest uppercase mb-2">Nhóm máu</h3>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-dark mb-10">Các nhóm máu của bạn</h2>

          <div className="grid grid-cols-4 gap-4 mb-8">
            {types.map(type => (
              <div key={type} className="bg-white rounded-2xl flex flex-col items-center justify-center py-5 border-2 border-red-50 hover:border-primary cursor-pointer hover:shadow-lg transition-all group">
                <div className="text-red-200 group-hover:text-primary mb-2 transition-colors">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.4C9.3 6.1 6 9.5 6 13.5A6 6 0 1 0 18 13.5C18 9.5 14.7 6.1 12 2.4z" /></svg>
                </div>
                <span className="font-extrabold text-primary text-xl">{type}</span>
              </div>
            ))}
          </div>

          <div className="bg-red-50/50 rounded-2xl p-5 text-sm text-gray-600 font-medium border border-red-50">
            Hiểu rõ nhóm máu giúp tăng khả năng kết nối và cứu sống nhiều người hơn.
            <button className="block mt-4 font-bold text-dark hover:text-primary transition-colors text-xs bg-white border border-gray-200 px-5 py-2.5 rounded-xl shadow-sm">Tìm hiểu tương thích nhóm máu →</button>
          </div>
        </div>

        {/* AI Process */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 border border-red-50 shadow-[0_4px_20px_-4px_rgba(239,68,68,0.05)]">
          <h3 className="text-xs font-bold text-secondary tracking-widest uppercase mb-2">Quy trình AI</h3>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-dark mb-16">Quy trình kết nối hiến máu</h2>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between relative mt-8 gap-y-12 md:gap-y-0 px-4">
            {/* Line behind */}
            <div className="hidden md:block absolute top-12 left-16 right-16 h-0.5 bg-gray-100 z-0"></div>

            <div className="relative z-10 flex flex-col items-center text-center max-w-[140px]">
              <div className="w-24 h-24 bg-red-50 text-primary rounded-full flex items-center justify-center border-4 border-white shadow-lg mb-4">
                <LocalHospitalIcon fontSize="large" sx={{ fontSize: 40 }} />
              </div>
              <div className="absolute -top-3 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold border-4 border-white shadow-sm">1</div>
              <div>
                <h4 className="font-bold text-sm text-dark mb-1">Bệnh viện yêu cầu</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">Bệnh viện tạo yêu cầu máu với thông tin chi tiết.</p>
              </div>
            </div>

            <div className="hidden md:block text-gray-300 transform -translate-y-6">→</div>

            <div className="relative z-10 flex flex-col items-center text-center max-w-[140px]">
              <div className="w-24 h-24 bg-orange-50 text-secondary rounded-full flex items-center justify-center border-4 border-white shadow-lg mb-4">
                <AutoAwesomeIcon fontSize="large" sx={{ fontSize: 40 }} />
              </div>
              <div className="absolute -top-3 w-8 h-8 bg-secondary text-white rounded-full flex items-center justify-center text-sm font-bold border-4 border-white shadow-sm">2</div>
              <div>
                <h4 className="font-bold text-sm text-dark mb-1">AI Matching</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">AI phân tích & tìm người hiến phù hợp nhất vài giây.</p>
              </div>
            </div>

            <div className="hidden md:block text-gray-300 transform -translate-y-6">→</div>

            <div className="relative z-10 flex flex-col items-center text-center max-w-[140px]">
              <div className="w-24 h-24 bg-blue-50 text-accent rounded-full flex items-center justify-center border-4 border-white shadow-lg mb-4">
                <FavoriteIcon fontSize="large" sx={{ fontSize: 40 }} />
              </div>
              <div className="absolute -top-3 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center text-sm font-bold border-4 border-white shadow-sm">3</div>
              <div>
                <h4 className="font-bold text-sm text-dark mb-1">Kết nối cứu người</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">Thông báo được gửi đến người hiến và kết nối.</p>
              </div>
            </div>
          </div>

          <div className="mt-14 flex justify-center">
            <button className="font-bold text-dark hover:text-primary transition-colors text-xs bg-white border border-gray-200 px-6 py-3 rounded-xl shadow-sm">Xem chi tiết cách hoạt động →</button>
          </div>
        </div>
      </div>
    </section>
  )
}
