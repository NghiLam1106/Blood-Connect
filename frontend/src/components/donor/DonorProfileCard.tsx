import { Switch } from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { useStore } from '../../store/useStore'
import { useMemo, useState } from 'react'

export function DonorProfileCard() {
  const { user, isAvailable, setAvailable } = useStore()
  const [imgError, setImgError] = useState(false)

  const avatarColorClass = useMemo(() => {
    if (!user?.name) return 'bg-primary'
    const colors = [
      'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500', 'bg-emerald-500',
      'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500',
      'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
    ]
    let hash = 0
    for (let i = 0; i < user.name.length; i++) {
      hash = user.name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }, [user?.name])

  const initial = useMemo(() => {
    if (!user?.name) return ''
    const parts = user.name.trim().split(' ')
    return parts.length > 0 ? parts[parts.length - 1].charAt(0).toUpperCase() : user.name.charAt(0).toUpperCase()
  }, [user?.name])

  if (!user) return null

  const hasAvatar = Boolean(user.avatar && user.avatar !== 'null' && user.avatar !== 'undefined' && user.avatar.trim() !== '' && !imgError);

  return (
    <div className={`col-span-1 lg:col-span-2 rounded-3xl p-8 border ${isAvailable ? 'border-primary/20 bg-gradient-to-br from-red-50 to-white' : 'border-gray-100 bg-white'} shadow-sm relative overflow-hidden transition-all duration-500`}>
      <div className="flex items-start gap-6 relative z-10">
        <div className="relative">
          <div className={`w-20 h-20 rounded-2xl ${hasAvatar ? 'bg-white' : avatarColorClass} border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden`}>
            {hasAvatar ?
              <img 
                src={user.avatar} 
                alt="avatar" 
                className="w-full h-full object-cover" 
                onError={() => setImgError(true)}
              />
              :
              <span className="text-3xl font-extrabold text-white">{initial}</span>
            }
          </div>
          <div className={`absolute -bottom-2 -right-2 w-6 h-6 border-2 border-white rounded-full ${isAvailable ? 'bg-success' : 'bg-gray-400'}`}></div>
        </div>

        <div className="flex-1 pt-1">
          <h2 className="text-2xl font-extrabold text-dark mb-1">{user.name}</h2>
          <div className="flex items-center gap-3">
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1 border border-primary/20">
              <FavoriteIcon sx={{ fontSize: 14 }} className="text-primary" /> Nhóm {user.bloodType}
            </span>
            <span className="text-sm font-semibold text-gray-500">{user.phone}</span>
          </div>

          <div className="mt-6 flex items-center justify-between bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/50">
            <span className="text-sm font-bold text-gray-700">
              Sẵn sàng hiến máu
            </span>
            <Switch
              checked={isAvailable}
              onChange={(_, val) => setAvailable(val)}
              color="error" // MUI error maps to primary red
              sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#EF4444' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#EF4444' } }}
            />
          </div>
        </div>
      </div>

      {/* Background Decoration */}
      {isAvailable && (
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
      )}
    </div>
  )
}
