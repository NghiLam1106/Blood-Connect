import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { paths } from './paths'
import { MainLayout } from '../layouts/MainLayout'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { PrivateRoute } from './PrivateRoute'
import { RoleRoute } from './RoleRoute'

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <CircularProgress sx={{ color: '#EF4444' }} />
  </Box>
)

const Loadable = (Component: React.ComponentType) => (props: any) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component {...props} />
  </Suspense>
)

// Public pages
const Home = Loadable(lazy(() => import('../pages/public/Home')))
const Knowledge = Loadable(lazy(() => import('../pages/public/Knowledge')))
const FAQ = Loadable(lazy(() => import('../pages/public/FAQ')))

// Auth pages
const AuthSelect = Loadable(lazy(() => import('../pages/auth/AuthSelect')))
const Login = Loadable(lazy(() => import('../pages/auth/Login')))
const DonorRegister = Loadable(lazy(() => import('../pages/auth/DonorRegister')))
const HospitalRegister = Loadable(lazy(() => import('../pages/auth/HospitalRegister')))
const ForgotPassword = Loadable(lazy(() => import('../pages/auth/ForgotPassword')))

// Donor Dashboard pages
const DonorDashboard = Loadable(lazy(() => import('../pages/donor/Dashboard')))
const DonorProfile = Loadable(lazy(() => import('../pages/donor/Profile')))
const DonorHistory = Loadable(lazy(() => import('../pages/donor/DonationHistory')))
const DonorAppointments = Loadable(lazy(() => import('../pages/donor/Appointments')))

// Hospital Dashboard pages
const HospitalDashboard = Loadable(lazy(() => import('../pages/hospital/Dashboard')))

// Admin Dashboard pages
const AdminDashboard = Loadable(lazy(() => import('../pages/admin/Dashboard')))

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: paths.public.home, element: <Home /> },
      { path: paths.public.knowledge, element: <Knowledge /> },
      { path: paths.public.faq, element: <FAQ /> },
    ],
  },
  {
    path: paths.auth.select,
    element: <AuthSelect />,
  },
  {
    path: paths.auth.login,
    element: <Login />,
  },
  {
    path: paths.auth.forgotPassword,
    element: <ForgotPassword />,
  },
  {
    path: paths.auth.registerDonor,
    element: <DonorRegister />,
  },
  {
    path: paths.auth.registerHospital,
    element: <HospitalRegister />,
  },
  {
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      // Donor Routes
      {
        path: paths.donor.dashboard,
        element: <RoleRoute requiredRole="donor"><DonorDashboard /></RoleRoute>,
      },
      {
        path: paths.donor.profile,
        element: <RoleRoute requiredRole="donor"><DonorProfile /></RoleRoute>,
      },
      {
        path: paths.donor.history,
        element: <RoleRoute requiredRole="donor"><DonorHistory /></RoleRoute>,
      },
      {
        path: paths.donor.appointments,
        element: <RoleRoute requiredRole="donor"><DonorAppointments /></RoleRoute>,
      },
      // Hospital Routes
      {
        path: paths.hospital.dashboard,
        element: <RoleRoute requiredRole="hospital"><HospitalDashboard /></RoleRoute>,
      },
      // Admin Routes
      {
        path: paths.admin.dashboard,
        element: <RoleRoute requiredRole="admin"><AdminDashboard /></RoleRoute>,
      },
      // Fallback
      {
        path: '/donor',
        element: <Navigate to={paths.donor.dashboard} replace />,
      },
      {
        path: '/hospital',
        element: <Navigate to={paths.hospital.dashboard} replace />,
      },
      {
        path: '/admin',
        element: <Navigate to={paths.admin.dashboard} replace />,
      }
    ]
  },
  {
    path: paths.public.notFound,
    element: <Navigate to={paths.public.home} replace />,
  },
])
