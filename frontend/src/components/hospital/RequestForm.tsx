import {
  Alert,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import FavoriteIcon from '@mui/icons-material/Favorite'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import type { BloodType } from '../../store/useStore'

const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const URGENCY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Bình thường', color: '#6b7280' },
  2: { label: 'Ưu tiên thấp', color: '#3b82f6' },
  3: { label: 'Ưu tiên', color: '#d97706' },
  4: { label: 'Khẩn cấp', color: '#f97316' },
  5: { label: 'Cực kỳ khẩn cấp', color: '#ef4444' },
}

interface RequestFormProps {
  bloodType: BloodType
  setBloodType: (v: BloodType) => void
  quantity: string
  setQuantity: (v: string) => void
  urgency: number
  setUrgency: (v: number) => void
  notes: string
  setNotes: (v: string) => void
  error: string
  isPending: boolean
  isSearching: boolean
  handleSearch: () => void
}

export function RequestForm({
  bloodType,
  setBloodType,
  quantity,
  setQuantity,
  urgency,
  setUrgency,
  notes,
  setNotes,
  error,
  isPending,
  isSearching,
  handleSearch
}: RequestFormProps) {
  return (
    <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #EFF6FF', boxShadow: '0 4px 20px -4px rgba(59,130,246,0.05)', height: 'fit-content', bgcolor: 'white' }}>
      <CardContent sx={{ p: 4 }}>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 bg-blue-50 text-accent rounded-xl flex items-center justify-center">
            <AddCircleOutlineIcon />
          </div>
          <h2 className="text-lg font-extrabold text-dark">
            Tạo yêu cầu AI Matching
          </h2>
        </div>

        {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>{error}</Alert>}

        <div className="space-y-5">
          <FormControl fullWidth size="medium">
            <InputLabel sx={{ fontWeight: 600 }}>Nhóm máu cần</InputLabel>
            <Select
              value={bloodType}
              label="Nhóm máu cần"
              onChange={(e) => setBloodType(e.target.value as BloodType)}
              sx={{ borderRadius: 3, bgcolor: '#f9fafb' }}
            >
              {BLOOD_TYPES.map((bt) => (
                <MenuItem key={bt} value={bt}>
                  <span className="flex items-center gap-2 font-bold text-dark">
                    <FavoriteIcon sx={{ fontSize: 16, color: '#ef4444' }} />
                    {bt}
                  </span>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Số đơn vị máu (túi 250ml)
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold outline-none focus:bg-white focus:border-accent focus:ring-4 focus:ring-blue-50 transition-all"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-bold text-gray-700">Độ khẩn cấp</label>
              <Chip
                label={URGENCY_LABELS[urgency].label}
                size="small"
                sx={{ bgcolor: `${URGENCY_LABELS[urgency].color}15`, color: URGENCY_LABELS[urgency].color, fontWeight: 800, px: 1, borderRadius: 2 }}
              />
            </div>
            <Slider
              value={urgency}
              min={1}
              max={5}
              step={1}
              marks
              onChange={(_, v) => setUrgency(v as number)}
              sx={{
                color: URGENCY_LABELS[urgency].color,
                height: 6,
                '& .MuiSlider-thumb': { width: 20, height: 20, border: '3px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
                '& .MuiSlider-track': { border: 'none' },
              }}
            />
            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              <span>Bình thường</span>
              <span>Cực khẩn</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Ghi chú lâm sàng</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Thông tin chi tiết về ca phẫu thuật..."
              rows={2}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:bg-white focus:border-accent focus:ring-4 focus:ring-blue-50 transition-all resize-none"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={isPending || isSearching}
            className="w-full bg-accent hover:bg-blue-600 disabled:opacity-70 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 text-sm mt-2"
          >
            {(isPending || isSearching) ? (
              <CircularProgress size={18} sx={{ color: 'white' }} />
            ) : (
              <SearchIcon fontSize="small" sx={{ fontWeight: 'bold' }} />
            )}
            {(isPending || isSearching) ? 'AI Đang Quét Người Hiến...' : 'Kích Hoạt AI Matching'}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
