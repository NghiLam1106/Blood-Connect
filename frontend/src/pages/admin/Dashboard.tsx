import React from 'react'
import { DashboardStats } from '../../components/admin/DashboardStats'
import { DemandChart } from '../../components/admin/DemandChart'
import { RecentTraffic } from '../../components/admin/RecentTraffic'

export default function AdminDashboard() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-dark mb-1">Tổng quan hệ thống</h1>
        <p className="text-gray-500 font-medium text-sm">Giám sát hoạt động BloodConnect 24/7</p>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <DemandChart />
        </div>
        <div className="xl:col-span-1">
          <RecentTraffic />
        </div>
      </div>
    </div>
  )
}
