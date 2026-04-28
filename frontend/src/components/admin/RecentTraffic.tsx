import React from 'react'
import { Card, CardContent } from '@mui/material'

export function RecentTraffic() {
  return (
    <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #f3f4f6', height: '100%', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.05)' }}>
      <CardContent sx={{ p: 4 }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-extrabold text-dark">Lưu lượng gần đây</h2>
          <span className="text-xs text-primary font-bold cursor-pointer hover:underline">Chi tiết</span>
        </div>

        <div className="space-y-4">
          {[
            { h: 'BV Chợ Rẫy', type: 'A+', time: '2 phút trước', status: 'Khẩn cấp' },
            { h: 'BV Bạch Mai', type: 'O-', time: '15 phút trước', status: 'Bình thường' },
            { h: 'BV TƯ Huế', type: 'B+', time: '1 giờ trước', status: 'Bình thường' },
            { h: 'BV 115', type: 'AB+', time: '3 giờ trước', status: 'Đã xử lý' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-sm text-dark">{item.h}</span>
                <span className="text-xs text-gray-400">{item.time}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-red-50 text-primary px-2 py-0.5 rounded text-[10px] font-bold border border-red-100">{item.type}</span>
                <span className={`text-[10px] font-bold ${item.status === 'Khẩn cấp' ? 'text-secondary' : 'text-gray-400'}`}>{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
