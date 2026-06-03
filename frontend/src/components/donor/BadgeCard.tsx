import FavoriteIcon from '@mui/icons-material/Favorite'

import { useStore } from '../../store/useStore'

// ─── Badge Tier Config ────────────────────────────────────────────────────────

type BadgeTier = {
  name: string
  minCount: number
  nextName: string
  nextCount: number
  gradient: string
  fromBg: string
  ringColor: string
  icon: React.ReactNode
}

const BADGE_TIERS: BadgeTier[] = [
  {
    name: 'Đồng',
    minCount: 1,
    nextName: 'Bạc',
    nextCount: 3,
    gradient: 'from-amber-500 to-amber-700',
    fromBg: 'from-amber-50',
    ringColor: 'bg-amber-700',
    icon: <FavoriteIcon className="text-white" sx={{ fontSize: 32 }} />,
  },
  {
    name: 'Bạc',
    minCount: 3,
    nextName: 'Vàng',
    nextCount: 5,
    gradient: 'from-gray-300 to-slate-500',
    fromBg: 'from-slate-50',
    ringColor: 'bg-slate-400',
    icon: <FavoriteIcon className="text-white" sx={{ fontSize: 32 }} />,
  },
  {
    name: 'Vàng',
    minCount: 5,
    nextName: 'Kim Cương',
    nextCount: 10,
    gradient: 'from-yellow-300 to-orange-500',
    fromBg: 'from-orange-50',
    ringColor: 'bg-yellow-400',
    icon: <FavoriteIcon className="text-white" sx={{ fontSize: 32 }} />,
  },
  {
    name: 'Kim Cương',
    minCount: 10,
    nextName: '',
    nextCount: 10,
    gradient: 'from-blue-400 to-purple-600',
    fromBg: 'from-blue-50',
    ringColor: 'bg-blue-500',
    icon: <FavoriteIcon className="text-white" sx={{ fontSize: 32 }} />,
  },
]

function getBadge(count: number): BadgeTier {
  // Trả về tier cao nhất mà user đạt được (từ dưới lên)
  for (let i = BADGE_TIERS.length - 1; i >= 0; i--) {
    if (count >= BADGE_TIERS[i].minCount) return BADGE_TIERS[i]
  }
  // Chưa đạt tier nào → dùng Đồng nhưng progress từ 0
  return { ...BADGE_TIERS[0], name: 'Chưa có', minCount: 0 }
}

function getProgress(count: number, tier: BadgeTier): number {
  if (tier.name === 'Kim Cương') return 100
  const prev = tier.minCount
  const next = tier.nextCount
  return Math.min(100, Math.round(((count - prev) / (next - prev)) * 100))
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BadgeCard() {
  const { user } = useStore()
  const count = user?.totalDonations ?? 0
  const tier = getBadge(count)
  const progress = getProgress(count, tier)
  const isMaxTier = tier.name === 'Kim Cương'

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col justify-center items-center text-center relative overflow-hidden">
      {/* Background gradient header */}
      <div className={`absolute top-0 inset-x-0 h-32 bg-gradient-to-b ${tier.fromBg} to-white z-0`} />

      {/* Badge Icon */}
      <div className="relative z-10 w-24 h-24 mb-6">
        <div className={`absolute inset-0 ${tier.ringColor} rounded-full opacity-25`} />
        <div className={`absolute inset-2 bg-gradient-to-br ${tier.gradient} rounded-full shadow-lg flex items-center justify-center border-4 border-white`}>
          {tier.icon}
        </div>
      </div>

      {/* Text content */}
      <div className="relative z-10">
        <h3 className="text-xl font-extrabold text-dark mb-2">Huy hiệu Ân nhân</h3>
        {count === 0 ? (
          <p className="text-sm text-gray-500 mb-6 px-4">
            Hãy thực hiện lần hiến máu đầu tiên để nhận huy hiệu <strong>Đồng</strong> và bắt đầu hành trình của bạn!
          </p>
        ) : (
          <p className="text-sm text-gray-500 mb-6 px-4">
            Bạn đã hiến máu <strong>{count} lần</strong> và đạt cấp bậc{' '}
            <strong>Ân nhân {tier.name}</strong>.{' '}
            {isMaxTier ? 'Cảm ơn bạn đã là người hùng thầm lặng!' : 'Hãy tiếp tục lan tỏa sự sống!'}
          </p>
        )}

        {/* Progress bar */}
        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2 overflow-hidden">
          <div
            className={`bg-gradient-to-r ${tier.gradient} h-2.5 rounded-full transition-all duration-700`}
            style={{ width: `${count === 0 ? 0 : progress}%` }}
          />
        </div>

        {/* Progress labels */}
        <div className="flex justify-between text-xs font-bold text-gray-400">
          {count === 0 ? (
            <>
              <span>Chưa có huy hiệu</span>
              <span>Đồng (cần 1 lần)</span>
            </>
          ) : isMaxTier ? (
            <>
              <span>Kim Cương</span>
              <span>🏆 Cấp cao nhất!</span>
            </>
          ) : (
            <>
              <span>{tier.name}</span>
              <span>{tier.nextName} (cần thêm {tier.nextCount - count} lần)</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
