import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Building2, Sparkles, HeartPulse, ArrowRight } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Bệnh viện yêu cầu',
    description: 'Bệnh viện tạo yêu cầu máu với nhóm máu và mức độ khẩn cấp.',
    icon: Building2,
    color: 'text-primary',
    bg: 'bg-red-50',
    gradient: 'from-red-50 to-softpink/50',
    border: 'border-red-100',
    glow: 'group-hover:shadow-red-500/20',
    shadow: 'shadow-red-500/10'
  },
  {
    id: 2,
    title: 'AI Matching',
    description: 'AI phân tích dữ liệu để tìm người hiến phù hợp nhanh nhất.',
    icon: Sparkles,
    color: 'text-secondary',
    bg: 'bg-orange-50',
    gradient: 'from-orange-50 to-orange-100/50',
    border: 'border-orange-100',
    glow: 'group-hover:shadow-orange-500/40',
    shadow: 'shadow-orange-500/20',
    isAI: true
  },
  {
    id: 3,
    title: 'Kết nối cứu người',
    description: 'Thông báo realtime được gửi đến người hiến gần nhất.',
    icon: HeartPulse,
    color: 'text-accent',
    bg: 'bg-blue-50',
    gradient: 'from-blue-50 to-blue-100/50',
    border: 'border-blue-100',
    glow: 'group-hover:shadow-blue-500/20',
    shadow: 'shadow-blue-500/10'
  }
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export default function ProcessSection() {
  return (
    <section id="process" className="relative py-20 bg-background overflow-hidden font-sans">
      {/* Background Ornaments */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-blue-100/30 mix-blend-multiply filter blur-[80px] opacity-60 animate-blob" />
        <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] rounded-full bg-red-100/40 mix-blend-multiply filter blur-[80px] opacity-60 animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[30%] w-[600px] h-[600px] rounded-full bg-orange-100/30 mix-blend-multiply filter blur-[80px] opacity-50 animate-blob animation-delay-4000" />
        
        {/* Subtle Dots Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] [background-size:30px_30px] opacity-50 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-6xl">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20 md:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100 shadow-sm text-primary font-bold text-sm mb-6 uppercase tracking-wider">
              <Sparkles size={16} className="text-primary" />
              <span>Quy trình AI</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-dark mb-6 tracking-tight">
              Quy trình kết nối hiến máu
            </h2>
            
            <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl">
              Hệ thống AI tự động phân tích và kết nối người hiến máu phù hợp chỉ trong vài giây.
            </p>
          </motion.div>
        </div>

        {/* Timeline Section */}
        <div className="relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-[110px] left-[15%] right-[15%] h-1 bg-gradient-to-r from-blue-100 via-red-200 to-orange-100 rounded-full z-0 overflow-hidden">
            <motion.div 
              initial={{ x: '-100%' }}
              whileInView={{ x: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-full h-full bg-gradient-to-r from-transparent via-red-500/30 to-transparent"
            />
          </div>

          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 relative z-10"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {steps.map((step) => (
              <motion.div
                key={step.id}
                variants={itemVariants}
                className={`group relative flex flex-col items-center text-center ${step.isAI ? 'lg:-translate-y-4' : ''}`}
              >
                {/* Floating Number Badge */}
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md z-20 ${step.isAI ? 'bg-secondary shadow-orange-500/40 scale-110' : 'bg-dark'}`}>
                  {step.id}
                </div>

                {/* Main Step Card */}
                <motion.div 
                  whileHover={{ y: -8, scale: step.isAI ? 1.05 : 1.02 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`w-full h-full p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer flex flex-col items-center transition-all duration-300 ease-out ${step.glow} ${step.isAI ? 'border-orange-100/80 shadow-[0_8px_30px_rgba(249,115,22,0.08)] bg-gradient-to-b from-white to-orange-50/20' : ''}`}
                >
                  {/* Icon Circle */}
                  <div className={`relative w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gradient-to-br ${step.gradient} ${step.border} border-2 shadow-lg ${step.shadow} group-hover:scale-110 transition-transform duration-300 ease-out z-10`}>
                    <step.icon strokeWidth={2} size={28} className={`${step.color} ${step.isAI ? 'drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]' : ''}`} />
                    
                    {/* Glow effect strictly for AI */}
                    {step.isAI && (
                      <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-secondary" style={{ animationDuration: '3s' }} />
                    )}
                  </div>

                  {/* AI Badge inside Card */}
                  {step.isAI && (
                    <div className="mb-2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 text-secondary text-[10px] sm:text-[11px] font-bold tracking-widest uppercase shadow-sm">
                      AI Powered
                    </div>
                  )}
                  
                  <h3 className={`text-lg font-extrabold text-dark mb-2 tracking-tight ${step.isAI ? 'text-secondary' : ''}`}>
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-[260px]">
                    {step.description}
                  </p>
                </motion.div>
                
                {/* Mobile Connector Arrow */}
                <div className="lg:hidden mt-8 text-gray-300">
                  {step.id !== 3 && <ArrowRight size={24} className="rotate-90 text-gray-300" />}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* CTA Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-20 flex justify-center"
        >
          <button className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-2xl shadow-[0_8px_25px_rgba(239,68,68,0.3)] hover:shadow-[0_15px_35px_rgba(239,68,68,0.4)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <span className="relative z-10 text-base tracking-wide">Xem chi tiết cách hoạt động</span>
            <ArrowRight size={20} className="relative z-10 transform group-hover:translate-x-1 transition-transform duration-300" />
            {/* Button Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
