import React from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  BrainCircuit,
  Siren,
  MapPin,
  History,
  BellRing,
  LayoutDashboard,
  Sparkles
} from 'lucide-react';

const features = [
  {
    icon: BrainCircuit,
    title: 'AI Blood Matching',
    description: 'AI gợi ý người hiến phù hợp theo nhóm máu, vị trí và lịch sử hiến.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-100'
  },
  {
    icon: Siren,
    title: 'Emergency Blood Requests',
    description: 'Hiển thị các yêu cầu máu khẩn cấp theo thời gian thực.',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-100'
  },
  {
    icon: MapPin,
    title: 'Nearby Donors',
    description: 'Tìm người hiến máu gần bệnh viện hoặc khu vực cần hỗ trợ.',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-100'
  },
  {
    icon: History,
    title: 'Donation History',
    description: 'Theo dõi lịch sử hiến máu và thời gian đủ điều kiện hiến tiếp.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-100'
  },
  {
    icon: BellRing,
    title: 'Smart Notifications',
    description: 'Gửi thông báo và nhắc lịch hiến máu tự động.',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-100'
  },
  {
    icon: LayoutDashboard,
    title: 'Hospital Dashboard',
    description: 'Dashboard quản lý yêu cầu máu và thống kê hệ thống.',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-100'
  }
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] // Custom ease out
    }
  }
};

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 bg-[#FFF7F7] overflow-hidden font-sans">
      {/* Background decorations for modern SaaS feel */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-red-200/40 mix-blend-multiply filter blur-[80px] opacity-70 animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-blue-200/40 mix-blend-multiply filter blur-[80px] opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] rounded-full bg-orange-200/30 mix-blend-multiply filter blur-[80px] opacity-70 animate-blob animation-delay-4000" />
        
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-red-100 shadow-sm text-red-500 font-semibold text-sm mb-6">
              <Sparkles size={16} className="text-red-500" />
              <span>Khám phá tính năng</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1F2937] mb-6 tracking-tight">
              Tính năng nổi bật
            </h2>
            
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              Nền tảng kết nối hiến máu thông minh giúp bệnh viện và người hiến máu kết nối nhanh chóng.
            </p>
          </motion.div>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group"
            >
              <div className="h-full relative p-8 md:p-10 rounded-[2.5rem] bg-white/70 backdrop-blur-xl border border-white shadow-lg hover:shadow-[0_20px_40px_rgba(239,68,68,0.12)] hover:-translate-y-2 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden">
                
                {/* Subtle gradient effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  {/* Icon Container */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border ${feature.borderColor} ${feature.bgColor} ${feature.color} group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white group-hover:border-red-500 transition-all duration-500 ease-out shadow-sm`}>
                    <feature.icon strokeWidth={2} size={32} />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-2xl font-bold text-[#1F2937] mb-4 group-hover:text-red-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
