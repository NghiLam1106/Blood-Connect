import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PendingIcon from '@mui/icons-material/Pending'
import { useEffect, useState, useTransition } from 'react'
import { useNavigate } from 'react-router-dom'
import { MatchingResults } from '../../components/hospital/MatchingResults'
import { RequestForm } from '../../components/hospital/RequestForm'
import { useDonorResponse } from '../../hooks/useDonorResponse'
import { requestBlood } from '../../services/hospital.service'
import type { BloodType, MatchedDonor } from '../../store/useStore'
import { useStore } from '../../store/useStore'

export default function HospitalDashboard() {
  const navigate = useNavigate()
  const { user, isAuthenticated, matchedDonors, isSearching, setMatchedDonors, setIsSearching } =
    useStore()
  const [isPending, startTransition] = useTransition()
  const [bloodType, setBloodType] = useState<BloodType>('O+')
  const [quantity, setQuantity] = useState('1')
  const [urgency, setUrgency] = useState(3)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [searchDone, setSearchDone] = useState(false)

  // Lắng nghe real-time phản hồi từ donor qua WebSocket
  useDonorResponse()

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth/login')
  }, [isAuthenticated, navigate])

  useEffect(() => {
    return () => {
      // Cleanup khi rời trang
      setMatchedDonors([])
      setSearchDone(false)
    }
  }, [])

  const handleSearch = () => {
    setError('')
    if (!quantity || Number(quantity) < 1) {
      setError('Vui lòng nhập số lượng đơn vị máu cần thiết.')
      return
    }

    setSearchDone(false)
    setMatchedDonors([])
    setIsSearching(true)

    startTransition(async () => {
      try {
        const res = await requestBlood(Number(user!.id), {
          quantity: Number(quantity),
          bloodType,
          urgency,
          notes,
        })

        const mergedResults = res.data?.mergedResults ?? []

        const mapped: MatchedDonor[] = mergedResults.map((item: any) => ({
          id: item.id,
          userId: item.userId,
          name: item.name ?? 'Không rõ',
          phone: item.phone ?? 'Không rõ',
          bloodType: item.bloodType as BloodType,
          distance: item.distance ?? 0,
          status: 'pending' as const,
          score: item.score,
          willDonate: item.will_donate,
        }))

        setMatchedDonors(mapped)
        setSearchDone(true)
      } catch (err: any) {
        setError(
          err?.response?.data?.message || 'Đã xảy ra lỗi khi tìm kiếm người hiến máu. Vui lòng thử lại.'
        )
      } finally {
        setIsSearching(false)
      }
    })
  }

  if (!user) return null

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-dark mb-1">Yêu cầu máu</h1>
          <p className="text-gray-500 font-medium text-sm">{user.name}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-blue-50 text-accent px-4 py-2 rounded-full text-xs font-bold border border-blue-100 shadow-sm">
          <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          Hệ thống AI đang hoạt động
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* ─── Request Form ─── */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          {/* Quick Stats Mini */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Đang chờ</p>
                <p className="text-2xl font-extrabold text-accent">
                  {matchedDonors.filter(d => d.status === 'pending').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-50 text-accent rounded-xl flex items-center justify-center">
                <PendingIcon />
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Đã chọn</p>
                <p className="text-2xl font-extrabold text-success">
                  {matchedDonors.filter(d => d.status === 'confirmed').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-50 text-success rounded-xl flex items-center justify-center">
                <CheckCircleIcon />
              </div>
            </div>
          </div>

          <RequestForm
            bloodType={bloodType}
            setBloodType={setBloodType}
            quantity={quantity}
            setQuantity={setQuantity}
            urgency={urgency}
            setUrgency={setUrgency}
            notes={notes}
            setNotes={setNotes}
            error={error}
            isPending={isPending}
            isSearching={isSearching}
            handleSearch={handleSearch}
          />
        </div>

        {/* ─── Matching Results ─── */}
        <div className="xl:col-span-7">
          <MatchingResults
            searchDone={searchDone}
            matchedDonors={matchedDonors}
            isPending={isPending}
            isSearching={isSearching}
            urgency={urgency}
            notes={notes}
            hospitalUserId={Number(user.id)}
          />
        </div>
      </div>
    </div>
  )
}
