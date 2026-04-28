import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { EmergencyAlertBanner } from '../../components/donor/EmergencyAlertBanner'
import { DonorProfileCard } from '../../components/donor/DonorProfileCard'
import { DonorStats } from '../../components/donor/DonorStats'
import { RecentDonations } from '../../components/donor/RecentDonations'
import { BadgeCard } from '../../components/donor/BadgeCard'

export default function DonorDashboard() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isAvailable, setActiveAlert, activeAlert } = useStore()

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth/login')
  }, [isAuthenticated, navigate])

  // Simulate alert for testing
  useEffect(() => {
    if (!isAvailable || activeAlert) return
    const timer = setTimeout(() => {
      setActiveAlert({
        id: `alert-${Date.now()}`,
        bloodType: user?.bloodType ?? 'O+',
        hospitalName: 'Bệnh viện Chợ Rẫy',
        hospitalAddress: '201B Nguyễn Chí Thanh, Phường 12, Quận 5, TP.HCM',
        distance: 2.5,
        urgencyLevel: 5,
        mapsUrl: `https://www.google.com/maps/search/bệnh+viện+chợ+rẫy`,
      })
    }, 8000)
    return () => clearTimeout(timer)
  }, [isAvailable, activeAlert, setActiveAlert, user?.bloodType])

  if (!user) return null

  return (
    <div className="max-w-4xl">
      {/* Dashboard Header Title */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-dark mb-1">Tổng quan Dashboard</h1>
          <p className="text-gray-500 font-medium text-sm">Theo dõi hoạt động và yêu cầu kết nối của bạn</p>
        </div>
      </div>

      {/* Emergency Alert (Rendered when active) */}
      <div className="mb-8">
        <EmergencyAlertBanner />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main User Card */}
        <DonorProfileCard />

        {/* Quick Stats Column */}
        <DonorStats />
      </div>

      {/* Bottom sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent History */}
        <RecentDonations />

        {/* User Score Badge */}
        <BadgeCard />
      </div>

    </div>
  )
}
