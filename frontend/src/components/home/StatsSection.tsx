import { useEffect, useRef, useState } from 'react'

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
    <span ref={ref} className="font-bold">
      {count.toLocaleString('vi-VN')}{suffix}
    </span>
  )
}

export function StatsSection() {
  const stats = [
    { label: 'Người hiến máu', value: 10000, suffix: '+', icon: '👱🏻‍♂️', color: 'text-primary', bg: 'bg-red-50' },
    { label: 'Đơn vị máu đã kết nối', value: 25000, suffix: '+', icon: '❤️', color: 'text-primary', bg: 'bg-red-50' },
    { label: 'Bệnh viện & cơ sở y tế', value: 500, suffix: '+', icon: '🏥', color: 'text-primary', bg: 'bg-red-50' },
    { label: 'Tỷ lệ hài lòng', value: 98, suffix: '%', icon: '😊', color: 'text-secondary', bg: 'bg-orange-50' },
  ]
  return (
    <section className="pb-16 pt-8 bg-background">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-3xl p-8 lg:p-10 border border-red-50 shadow-sm flex flex-wrap justify-between items-center gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col md:flex-row items-center text-center md:text-left gap-4 flex-1 min-w-[200px]">
              <div className={`w-16 h-16 ${stat.bg} rounded-full flex items-center justify-center text-3xl`}>
                {stat.icon}
              </div>
              <div>
                <div className={`text-3xl ${stat.color} font-extrabold`}><AnimatedCounter target={stat.value} suffix={stat.suffix} /></div>
                <div className="text-gray-500 text-sm font-semibold mt-1">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
