import FavoriteIcon from '@mui/icons-material/Favorite'

export function BadgeCard() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col justify-center items-center text-center relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-orange-50 to-white z-0"></div>

      <div className="relative z-10 w-24 h-24 mb-6">
        {/* Custom Badge SVG Placeholder */}
        <div className="absolute inset-0 bg-secondary rounded-full transform rotate-45 opacity-20"></div>
        <div className="absolute inset-2 bg-gradient-to-br from-yellow-300 to-orange-500 rounded-full shadow-lg flex items-center justify-center border-4 border-white">
          <FavoriteIcon className="text-white" sx={{ fontSize: 32 }} />
        </div>
      </div>

      <div className="relative z-10">
        <h3 className="text-xl font-extrabold text-dark mb-2">Huy hiệu Ân nhân</h3>
        <p className="text-sm text-gray-500 mb-6 px-4">Bạn đã hiến máu nhiều lần và đạt cấp bậc <strong>Ân nhân Vàng</strong>. Hãy tiếp tục lan tỏa sự sống!</p>

        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-400 to-primary h-2.5 rounded-full w-4/5"></div>
        </div>
        <div className="flex justify-between text-xs font-bold text-gray-400">
          <span>Vàng</span>
          <span>Kim Cương (cần 2 lần)</span>
        </div>
      </div>
    </div>
  )
}
