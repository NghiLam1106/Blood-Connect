import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Logo } from '../components/layout/Logo'
import DashboardIcon from '@mui/icons-material/Dashboard'
import FavoriteIcon from '@mui/icons-material/Favorite'
import HistoryIcon from '@mui/icons-material/History'
import PersonIcon from '@mui/icons-material/Person'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import ReceiptIcon from '@mui/icons-material/Receipt'
import AssessmentIcon from '@mui/icons-material/Assessment'
import PeopleIcon from '@mui/icons-material/People'
import SettingsIcon from '@mui/icons-material/Settings'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import LogoutIcon from '@mui/icons-material/Logout'

// Role configs
const ROLE_CONFIGS = {
    donor: {
        color: 'text-primary',
        bgActive: 'bg-red-50',
        borderActive: 'border-l-primary',
        menu: [
            { label: 'Dashboard', path: '/donor/dashboard', icon: <DashboardIcon /> },
            // { label: 'Yêu cầu phù hợp', path: '/donor/appointments', icon: <FavoriteIcon /> },
            { label: 'Lịch sử hiến máu', path: '/donor/history', icon: <HistoryIcon /> },
            { label: 'Hồ sơ cá nhân', path: '/donor/profile', icon: <PersonIcon /> },
        ]
    },
    hospital: {
        color: 'text-accent',
        bgActive: 'bg-blue-50',
        borderActive: 'border-l-accent',
        menu: [
            { label: 'Dashboard', path: '/hospital/dashboard', icon: <DashboardIcon /> },
            // { label: 'Tạo yêu cầu', path: '/hospital/requests', icon: <ReceiptIcon /> },
            { label: 'Matching Donor', path: '/hospital/matching', icon: <FavoriteIcon /> },
            { label: 'Báo cáo', path: '/hospital/reports', icon: <AssessmentIcon /> },
        ]
    },
    admin: {
        color: 'text-purple-600',
        bgActive: 'bg-purple-50',
        borderActive: 'border-l-purple-600',
        menu: [
            { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
            { label: 'Quản lý Donor', path: '/admin/users', icon: <PeopleIcon /> },
            { label: 'Quản lý Hospital', path: '/admin/hospitals', icon: <LocalHospitalIcon /> },
            { label: 'Cấu hình hệ thống', path: '/admin/settings', icon: <SettingsIcon /> },
        ]
    }
}

export function DashboardLayout() {
    const { user, logout } = useStore()
    const location = useLocation()
    const navigate = useNavigate()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // Default to donor config if no user (shouldn't happen with auth guards but for safety)
    const role = (user?.role as keyof typeof ROLE_CONFIGS) || 'donor'
    const config = ROLE_CONFIGS[role]

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const SidebarContent = () => (
        <div className="h-full flex flex-col bg-white border-r border-gray-100">
            <div className="p-6">
                <Link to="/" className="inline-block no-underline">
                    <Logo autoHideTextOnMobile={false} />
                </Link>
            </div>

            {/* User Info minimal */}
            <div className="px-6 py-4 flex items-center gap-3 border-b border-gray-50 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${role === 'donor' ? 'bg-primary' : role === 'hospital' ? 'bg-accent' : 'bg-purple-600'}`}>
                    {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-dark truncate">Xin chào, {user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{role}</p>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {config.menu.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm no-underline ${isActive
                                    ? `${config.bgActive} ${config.color} border-l-4 ${config.borderActive}`
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-dark border-l-4 border-transparent'
                                }`}
                        >
                            <span className={isActive ? config.color : 'text-gray-400'}>{item.icon}</span>
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-gray-500 font-semibold text-sm hover:bg-red-50 hover:text-primary transition-colors transition-all focus:outline-none"
                >
                    <LogoutIcon className="text-gray-400 group-hover:text-primary" />
                    Đăng xuất
                </button>
            </div>
        </div>
    )

    return (
        <div className="flex h-screen bg-background font-sans">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 h-screen fixed inset-y-0 left-0 z-40">
                <SidebarContent />
            </aside>

            {/* Mobile Header & Sidebar overlay */}
            <div className="lg:hidden fixed top-0 inset-x-0 h-16 bg-white border-b border-gray-100 z-50 flex items-center px-4 justify-between shadow-sm">
                <Logo autoHideTextOnMobile={false} />
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-600 p-2">
                    {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                </button>
            </div>

            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
                    <div className="w-72 h-full" onClick={(e) => e.stopPropagation()}>
                        <SidebarContent />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 h-screen overflow-y-auto lg:ml-72 pt-16 lg:pt-0">
                <div className="p-4 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
