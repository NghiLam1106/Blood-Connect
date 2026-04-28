import { useNavigate } from 'react-router-dom'
import FavoriteIcon from '@mui/icons-material/Favorite'

// Mock donation history
const DONATION_HISTORY = [
  { id: 1, date: '15/01/2026', hospital: 'Bệnh viện Chợ Rẫy', type: 'O+', volume: '350ml', status: 'completed' },
  { id: 2, date: '10/09/2025', hospital: 'Bệnh viện 115', type: 'O+', volume: '350ml', status: 'completed' },
  { id: 3, date: '20/04/2025', hospital: 'Bệnh viện Truyền máu Huyết học', type: 'O+', volume: '250ml', status: 'completed' },
]

export function RecentDonations() {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-extrabold text-dark text-lg">Lịch sử hiến máu</h3>
        <button className="text-xs font-bold text-primary hover:underline" onClick={() => navigate('/donor/history')}>Xem tất cả</button>
      </div>

      <div className="space-y-4">
        {DONATION_HISTORY.slice(0, 3).map(item => (
          <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-primary shrink-0">
              <FavoriteIcon fontSize="small" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-dark">{item.hospital}</h4>
              <p className="text-xs text-gray-400 mt-0.5">{item.date}</p>
            </div>
            <div className="text-right">
              <div className="font-bold text-dark text-sm">{item.volume}</div>
              <div className="text-[10px] font-bold text-success mt-0.5 bg-success/10 px-2 py-0.5 rounded text-center uppercase">Thành công</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
