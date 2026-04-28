import { useState } from 'react'

const FAQS = [
  { id: 1, q: 'Hiến máu có đau không?', a: 'Quá trình hiến máu chỉ hơi nhói đau như kiến cắn lúc tiêm kim qua da vài giây đầu tiên. Sau đó bạn sẽ không còn cảm giác đau trong suốt quá trình lấy máu.' },
  { id: 2, q: 'Hiến máu có ảnh hưởng đến sức khỏe không?', a: 'Hiến máu theo đúng quy định không hại sức khỏe, mà còn giúp cơ thể tái tạo máu mới sinh lực hơn, giảm nguy cơ mắc bệnh tim mạch và loại bỏ lượng sắt thừa trong cơ thể.' },
  { id: 3, q: 'Bao lâu thì sức khỏe hồi phục hoàn toàn?', a: 'Lượng chất lỏng sẽ bù lại trong vòng 24h nếu bạn uống đủ nước. Lượng hồng cầu sẽ được cơ thể tự động tái tạo hoàn toàn trong vòng 3-4 tuần.' },
  { id: 4, q: 'Điều kiện hiến máu là gì?', a: 'Bạn cần nằm trong độ tuổi 18-60, cân nặng >45kg (nữ), >50kg (nam), không mắc các bệnh truyền nhiễm hoặc bệnh tim mạch nghiêm trọng, huyết áp bình thường và đang cảm thấy khỏe.' },
  { id: 5, q: 'Tôi phải mất bao lâu để hoàn tất hiến máu?', a: 'Quá trình lấy máu chỉ diễn ra 10-15 phút. Tính toàn bộ thời gian đăng ký, khám sàng lọc và nghỉ ngơi sau hiến thì bạn sẽ cần khoảng 45-60 phút.' },
  { id: 6, q: 'Sau bao lâu tôi có thể hiến máu trở lại?', a: 'Khoảng cách giữa hai lần hiến máu toàn phần tối thiểu là 12 tuần (84 ngày) để cơ thể phục hồi hoàn toàn lượng máu.' }
]

export function FaqList() {
  const [openId, setOpenId] = useState<number | null>(1)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredFaqs = FAQS.filter(faq =>
    faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.a.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-4xl font-extrabold text-dark mb-4 tracking-tight">Hỏi đáp <span className="text-primary">thường gặp</span></h1>
        <p className="text-gray-500">Mọi thắc mắc của bạn về quá trình hiến máu và hệ thống RedBridge AI đều được giải đáp tại đây.</p>
      </div>

      {/* Search */}
      <div className="max-w-3xl mx-auto relative mb-12">
        <input
          type="text"
          placeholder="Bạn muốn hỏi gì về hiến máu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-red-100 text-dark text-base rounded-2xl shadow-sm focus:ring-primary focus:border-primary block px-6 py-4 outline-none transition-colors"
        />
        <div className="absolute right-5 top-4 text-gray-400 text-xl">🔍</div>
      </div>

      {/* FAQ Accordion */}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-red-50">
        {filteredFaqs.length > 0 ? (
          <div className="flex flex-col gap-4">
            {filteredFaqs.map(faq => {
              const isOpen = openId === faq.id
              return (
                <div
                  key={faq.id}
                  className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-primary shadow-md' : 'border-gray-100 hover:border-red-200'}`}
                >
                  <button
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between bg-white focus:outline-none"
                  >
                    <span className={`font-bold pr-4 ${isOpen ? 'text-primary' : 'text-dark'}`}>{faq.q}</span>
                    <span className={`text-xl transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-gray-400'}`}>
                      ↓
                    </span>
                  </button>
                  <div
                    className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <p className="text-gray-600 leading-relaxed text-sm">{faq.a}</p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-dark font-bold">Không tìm thấy câu hỏi phù hợp.</p>
          </div>
        )}
      </div>
    </>
  )
}
