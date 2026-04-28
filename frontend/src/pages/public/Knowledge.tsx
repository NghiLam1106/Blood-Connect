import { useState } from 'react'

const CATEGORIES = ['Tất cả', 'Điều kiện', 'Lợi ích', 'Quy trình', 'Chăm sóc', 'Nhóm máu']

const ARTICLES = [
  { id: 1, category: 'Điều kiện', title: 'Điều kiện cơ bản để tham gia hiến máu', excerpt: 'Bạn cần đảm bảo sức khỏe tốt, cân nặng trên 45kg và độ tuổi từ 18-60...', date: '22/04/2026' },
  { id: 2, category: 'Lợi ích', title: '5 lợi ích tuyệt vời của việc hiến máu thường xuyên', excerpt: 'Hiến máu không chỉ cứu người mà còn giúp cơ thể bạn tái tạo máu mới, giảm thiểu nguy cơ bệnh lý...', date: '20/04/2026' },
  { id: 3, category: 'Quy trình', title: 'Các bước chuẩn bị trước khi đi hiến máu', excerpt: 'Một đêm ngủ ngon tròn giấc, ăn nhẹ buổi sáng và uống đủ nước là điều cần thiết để chuẩn bị...', date: '18/04/2026' },
  { id: 4, category: 'Chăm sóc', title: 'Nên ăn gì và làm gì sau khi hiến máu?', excerpt: 'Tránh làm việc nặng trong ngày đầu tiên, bổ sung thực phẩm giàu sắt và uống nhiều nước...', date: '15/04/2026' },
  { id: 5, category: 'Nhóm máu', title: 'Giải mã sự tương thích giữa các nhóm máu', excerpt: 'Nhóm máu O là người cho phổ quát, trong khi nhóm máu AB là người nhận phổ quát. Xêm chi tiết...', date: '10/04/2026' },
  { id: 6, category: 'Điều kiện', title: 'Vừa tiêm vắc xin xong có được hiến máu không?', excerpt: 'Tùy thuộc vào loại vắc xin, thời gian chờ để hiến máu có thể từ 1 tuần đến 1 tháng...', date: '05/04/2026' },
]

export default function Knowledge() {
  const [activeCategory, setActiveCategory] = useState('Tất cả')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredArticles = ARTICLES.filter(article => {
    const matchCategory = activeCategory === 'Tất cả' || article.category === activeCategory
    const matchSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase())
    return matchCategory && matchSearch
  })

  return (
    <div className="pt-8 pb-20 bg-background min-h-screen">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-extrabold text-dark mb-4 tracking-tight">Kiến thức <span className="text-primary">Hiến Máu</span></h1>
          <p className="text-gray-500">Trang bị kiến thức chuẩn xác để quá trình hiến máu của bạn diễn ra an toàn và mang lại kết quả tốt nhất.</p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-12 bg-white p-4 rounded-2xl shadow-sm border border-red-50">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeCategory === cat
                    ? 'bg-primary text-white shadow-md shadow-red-500/30'
                    : 'bg-red-50 text-gray-600 hover:bg-red-100 hover:text-primary'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="w-full md:w-auto relative">
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 bg-gray-50 border border-gray-200 text-dark text-sm rounded-xl focus:ring-primary focus:border-primary block px-4 py-3 outline-none transition-colors"
            />
            <div className="absolute right-3 top-3 text-gray-400">🔍</div>
          </div>
        </div>

        {/* Grid */}
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map(article => (
              <div key={article.id} className="bg-white rounded-3xl overflow-hidden border border-red-50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col h-full">
                <div className="h-48 bg-red-100 flex items-center justify-center relative overflow-hidden">
                  <span className="text-4xl opacity-20">📖</span>
                  {/* Placeholder gradient mimicking image */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-200/50 to-orange-100/50 group-hover:scale-105 transition-transform duration-500"></div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-red-50 text-primary text-xs font-bold px-2.5 py-1 rounded-md">{article.category}</span>
                    <span className="text-gray-400 text-xs">{article.date}</span>
                  </div>
                  <h3 className="font-extrabold text-lg text-dark mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="mt-auto">
                    <button className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                      Đọc thêm <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-dark">Không tìm thấy bài viết nào</h3>
            <p className="text-gray-500 mt-2">Vui lòng thử lại với từ khóa khác.</p>
          </div>
        )}
      </div>
    </div>
  )
}
