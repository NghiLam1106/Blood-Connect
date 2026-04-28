import FavoriteIcon from '@mui/icons-material/Favorite'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import { useStore } from '../../store/useStore'

export function DonorStats() {
  const { user } = useStore()

  if (!user) return null

  return (
    <div className="col-span-1 flex flex-col gap-4">
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex-1 flex flex-col justify-center relative overflow-hidden">
        <div className="absolute right-0 top-0 w-24 h-24 bg-red-50 rounded-bl-full pointer-events-none -z-0"></div>
        <div className="text-primary opacity-80 mb-2 relative z-10"><FavoriteIcon /></div>
        <div className="text-3xl font-extrabold text-dark relative z-10">{user.totalDonations ?? 0}<span className="text-base text-gray-400 ml-1 font-medium">lần</span></div>
        <div className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider relative z-10">Tổng số lần hiến</div>
      </div>
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex-1 flex flex-col justify-center relative overflow-hidden">
        <div className="absolute right-0 top-0 w-24 h-24 bg-orange-50 rounded-bl-full pointer-events-none -z-0"></div>
        <div className="text-secondary opacity-80 mb-2 relative z-10"><LocalHospitalIcon /></div>
        <div className="text-3xl font-extrabold text-dark relative z-10">{(user.totalDonations ?? 0) * 3}<span className="text-base text-gray-400 ml-1 font-medium">người</span></div>
        <div className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider relative z-10">Ước tính đã cứu</div>
      </div>
    </div>
  )
}
