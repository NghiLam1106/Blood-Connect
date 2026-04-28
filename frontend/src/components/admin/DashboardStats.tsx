import React from 'react'

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm border-l-4 border-l-purple-600 hover:-translate-y-1 transition-transform">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Người hiến</p>
        <p className="text-3xl font-extrabold text-purple-600">12,496</p>
      </div>
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm border-l-4 border-l-success hover:-translate-y-1 transition-transform">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Đơn vị máu</p>
        <p className="text-3xl font-extrabold text-success">8,342</p>
      </div>
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm border-l-4 border-l-dark hover:-translate-y-1 transition-transform">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Bệnh viện</p>
        <p className="text-3xl font-extrabold text-dark">512</p>
      </div>
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm border-l-4 border-l-secondary hover:-translate-y-1 transition-transform">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Kết nối hôm nay</p>
        <p className="text-3xl font-extrabold text-secondary">24</p>
      </div>
    </div>
  )
}
