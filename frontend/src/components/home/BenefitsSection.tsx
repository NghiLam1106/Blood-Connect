export function BenefitsSection() {
  const benefits = [
    { icon: '❤️', title: 'Cứu người lập tức', desc: 'Kết nối nhanh chóng giúp bệnh nhân nhận máu kịp thời.' },
    { icon: '🛡️', title: 'Minh bạch & an toàn', desc: 'Thông bảo mật, quy trình rõ ràng, đáng tin cậy.' },
    { icon: '⭐', title: 'Cộng đồng nhân ái', desc: 'Tham gia cộng đồng hiến máu lớn mạnh trên toàn quốc.' },
    { icon: '📈', title: 'Công nghệ AI thông minh', desc: 'AI giúp tìm người phù hợp nhất theo thời gian thực.' },
  ]
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-extrabold text-dark mb-10">Lợi ích khi tham gia RedBridge AI</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, i) => (
            <div key={i} className="bg-white rounded-3xl p-8 border border-red-50 shadow-[0_4px_15px_-4px_rgba(239,68,68,0.05)] text-center hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 mx-auto bg-background rounded-full flex items-center justify-center text-3xl mb-6">{b.icon}</div>
              <h3 className="font-extrabold text-dark text-lg mb-3">{b.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
