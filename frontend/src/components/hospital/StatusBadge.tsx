import { Chip } from '@mui/material'
import PendingIcon from '@mui/icons-material/Pending'
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import type { MatchedDonor } from '../../store/useStore'

export function StatusBadge({ status }: { status: MatchedDonor['status'] }) {
  const config = {
    pending: { icon: <PendingIcon sx={{ fontSize: 14 }} />, label: 'Chờ phản hồi', color: '#d97706', bg: '#fef3c7' },
    confirmed: { icon: <DirectionsRunIcon sx={{ fontSize: 14 }} />, label: 'Đang đến', color: '#3b82f6', bg: '#eff6ff' },
    arrived: { icon: <CheckCircleIcon sx={{ fontSize: 14 }} />, label: 'Đã đến', color: '#22c55e', bg: '#f0fdf4' },
    rejected: { icon: <></>, label: 'Từ chối', color: '#ef4444', bg: '#fef2f2' },
  }[status]

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      size="small"
      sx={{
        bgcolor: config.bg,
        color: config.color,
        fontWeight: 700,
        fontSize: '0.7rem',
        borderRadius: '8px',
        '& .MuiChip-icon': { color: config.color },
      }}
    />
  )
}
