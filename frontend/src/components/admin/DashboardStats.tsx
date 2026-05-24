import { useEffect, useState } from 'react'
import type { AdminStats } from '../../services/admin.service'
import { getAdminStats } from '../../services/admin.service'

function StatCard({
  label,
  value,
  colorClass,
  borderClass,
  loading,
}: {
  label: string
  value: number | null
  colorClass: string
  borderClass: string
  loading: boolean
}) {
  return (
    <div
      className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-sm ${borderClass} hover:-translate-y-1 transition-transform`}
    >
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
        {label}
      </p>
      {loading ? (
        <div className="h-9 w-24 bg-gray-200 rounded-lg animate-pulse" />
      ) : (
        <p className={`text-3xl font-extrabold ${colorClass}`}>
          {value !== null ? value.toLocaleString('vi-VN') : '—'}
        </p>
      )}
    </div>
  )
}

export function DashboardStats() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminStats()
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        label="Người hiến"
        value={stats?.totalDonors ?? null}
        colorClass="text-purple-600"
        borderClass="border-l-4 border-l-purple-600"
        loading={loading}
      />
      <StatCard
        label="Đơn vị máu"
        value={stats?.totalBloodUnits._sum.unitBlood ?? null}
        colorClass="text-success"
        borderClass="border-l-4 border-l-success"
        loading={loading}
      />
      <StatCard
        label="Bệnh viện"
        value={stats?.totalHospitals ?? null}
        colorClass="text-dark"
        borderClass="border-l-4 border-l-dark"
        loading={loading}
      />
      <StatCard
        label="Kết nối hôm nay"
        value={stats?.todayConnections ?? null}
        colorClass="text-secondary"
        borderClass="border-l-4 border-l-secondary"
        loading={loading}
      />
    </div>
  )
}
