import React from 'react'
import { Card, CardContent } from '@mui/material'

export function DemandChart() {
  return (
    <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #f3f4f6', height: '100%', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.05)' }}>
      <CardContent sx={{ p: 4 }}>
        <h2 className="text-lg font-extrabold text-dark mb-6">Biểu đồ yêu cầu & đáp ứng (30 ngày)</h2>

        {/* Mock Chart Area */}
        <div className="h-[300px] w-full bg-gradient-to-t from-gray-50 to-white rounded-xl flex items-end justify-between px-4 pb-0 pt-6 border-b border-l border-gray-200 relative">
          <div className="w-1/12 bg-purple-200 rounded-t-sm h-[40%] hover:bg-purple-300 transition-colors relative group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-bold">40%</span></div>
          <div className="w-1/12 bg-purple-300 rounded-t-sm h-[50%] hover:bg-purple-400 transition-colors relative group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-bold">50%</span></div>
          <div className="w-1/12 bg-purple-400 rounded-t-sm h-[80%] hover:bg-purple-500 transition-colors relative group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-bold">80%</span></div>
          <div className="w-1/12 bg-purple-300 rounded-t-sm h-[60%] hover:bg-purple-400 transition-colors relative group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-bold">60%</span></div>
          <div className="w-1/12 bg-purple-500 rounded-t-sm h-[95%] hover:bg-purple-600 transition-colors relative group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-bold">95%</span></div>
          <div className="w-1/12 bg-purple-300 rounded-t-sm h-[70%] hover:bg-purple-400 transition-colors relative group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-bold">70%</span></div>
          <div className="w-1/12 bg-purple-400 rounded-t-sm h-[85%] hover:bg-purple-500 transition-colors relative group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-bold">85%</span></div>

          <div className="absolute top-4 left-4 flex gap-4">
            <div className="flex items-center gap-1 text-xs text-gray-500"><span className="w-3 h-3 bg-purple-500 rounded-sm"></span> Yêu cầu</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
