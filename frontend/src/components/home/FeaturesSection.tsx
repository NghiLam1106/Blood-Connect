import React from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  BrainCircuit,
  Siren,
  MapPin,
  History,
  BellRing,
  LayoutDashboard,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const features = [
  {
    icon: BrainCircuit,
    title: 'AI Blood Matching',
    description: 'AI gợi ý người hiến phù hợp theo nhóm máu, vị trí và lịch sử hiến.',
    color: 'text-accent',
    iconBg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    iconBorder: 'border-blue-200/60',
    badge: 'AI Powered',
    badgeColor: 'bg-blue-50 text-accent border-blue-100',
    hoverShadow: 'hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.15)]',
    hoverBorder: 'group-hover:border-blue-200'
  },
  {
    icon: Siren,
    title: 'Emergency Blood Requests',
    description: 'Hiển thị các yêu cầu máu khẩn cấp theo thời gian thực.',
    color: 'text-primary',
    iconBg: 'bg-gradient-to-br from-red-50 to-rose-50',
    iconBorder: 'border-red-200/60',
    badge: 'Realtime',
    badgeColor: 'bg-red-50 text-primary border-red-100',
    hoverShadow: 'hover:shadow-[0_20px_40px_-15px_rgba(239,68,68,0.15)]',
    hoverBorder: 'group-hover:border-red-200'
  },
  {
    icon: MapPin,
    title: 'Nearby Donors',
    description: 'Tìm người hiến máu gần bệnh viện hoặc khu vực cần hỗ trợ.',
    color: 'text-secondary',
    iconBg: 'bg-gradient-to-br from-orange-50 to-amber-50',
    iconBorder: 'border-orange-200/60',
    badge: 'Location',
    badgeColor: 'bg-orange-50 text-secondary border-orange-100',
    hoverShadow: 'hover:shadow-[0_20px_40px_-15px_rgba(249,115,22,0.15)]',
    hoverBorder: 'group-hover:border-orange-200'
  },
  {
    icon: History,
    title: 'Donation History',
    description: 'Theo dõi lịch sử hiến máu và thời gian đủ điều kiện hiến tiếp.',
    color: 'text-accent',
    iconBg: 'bg-gradient-to-br from-blue-50 to-sky-50',
    iconBorder: 'border-blue-200/60',
    badge: 'Smart',
    badgeColor: 'bg-blue-50 text-accent border-blue-100',
    hoverShadow: 'hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.15)]',
    hoverBorder: 'group-hover:border-blue-200'
  },
  {
    icon: BellRing,
    title: 'Smart Notifications',
    description: 'Nhận thông báo realtime về nhu cầu máu gần bạn.',
    color: 'text-secondary',
    iconBg: 'bg-gradient-to-br from-amber-50 to-yellow-50',
    iconBorder: 'border-amber-200/60',
    badge: 'Realtime',
    badgeColor: 'bg-amber-50 text-secondary border-amber-100',
    hoverShadow: 'hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.15)]',
    hoverBorder: 'group-hover:border-amber-200'
  },
  {
    icon: LayoutDashboard,
    title: 'Hospital Dashboard',
    description: 'Dashboard quản lý yêu cầu máu và thống kê hệ thống.',
    color: 'text-primary',
    iconBg: 'bg-gradient-to-br from-rose-50 to-pink-50',
    iconBorder: 'border-rose-200/60',
    badge: 'Management',
    badgeColor: 'bg-rose-50 text-primary border-rose-100',
    hoverShadow: 'hover:shadow-[0_20px_40px_-15px_rgba(225,29,72,0.15)]',
    hoverBorder: 'group-hover:border-rose-200'
  }
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] // Custom refined spring-like ease
    }
  }
};

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-20 bg-white overflow-hidden font-sans">
      {/* Background Depth & Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-red-100/40 mix-blend-multiply filter blur-[100px] opacity-60 animate-blob" />
        <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-100/40 mix-blend-multiply filter blur-[100px] opacity-60 animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[700px] h-[700px] rounded-full bg-orange-100/30 mix-blend-multiply filter blur-[100px] opacity-50 animate-blob animation-delay-4000" />
        
        {/* Subtle SaaS Dot Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-40 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-100 shadow-sm text-primary font-medium text-sm mb-6 transition-all hover:bg-red-100 cursor-default">
              <Sparkles size={16} className="text-primary" />
              <span>RedBridge Ai Features</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-dark mb-6 tracking-tight">
              Tính năng nổi bật
            </h2>
            
            <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl">
              Nền tảng kết nối hiến máu thông minh giúp bệnh viện và người hiến kết nối nhanh chóng.
            </p>
          </motion.div>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -6 }}
              className={`group relative p-5 md:p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${feature.hoverShadow} ${feature.hoverBorder} transition-all duration-300 ease-out cursor-pointer flex flex-col h-full`}
            >
              <div className="flex items-start justify-between mb-6">
                {/* Icon Box */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${feature.iconBorder} ${feature.iconBg} ${feature.color} group-hover:scale-110 transition-transform duration-300 ease-out shadow-inner`}>
                  <feature.icon strokeWidth={2} size={24} />
                </div>
                
                {/* Subtle Badge */}
                <div className={`px-3 py-1 rounded-full border text-xs font-semibold tracking-wide ${feature.badgeColor} opacity-80 group-hover:opacity-100 transition-opacity duration-300`}>
                  {feature.badge}
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 flex flex-col">
                <h3 className="text-lg md:text-xl font-extrabold text-dark mb-2 tracking-tight group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm md:text-base leading-relaxed line-clamp-2">
                  {feature.description}
                </p>
              </div>

              {/* Bottom interactive hint */}
              <div className="mt-4 flex items-center text-sm font-semibold text-gray-400 group-hover:text-primary transition-colors duration-300">
                <span>Tìm hiểu thêm</span>
                <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
