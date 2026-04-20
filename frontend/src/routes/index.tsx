import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { paths } from './paths'
import { MainLayout } from '../layouts/MainLayout'
import { PrivateRoute } from './PrivateRoute'
import { RoleRoute } from './RoleRoute'

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <CircularProgress sx={{ color: '#dc2626' }} />
  </Box>
)

const Loadable = (Component: React.ComponentType) => (props: any) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component {...props} />
  </Suspense>
)

// Public pages
const Home = Loadable(lazy(() => import('../pages/public/Home')))
// Auth pages
const AuthSelect = Loadable(lazy(() => import('../pages/auth/AuthSelect')))
const Login = Loadable(lazy(() => import('../pages/auth/Login')))
const DonorRegister = Loadable(lazy(() => import('../pages/auth/DonorRegister')))
const HospitalRegister = Loadable(lazy(() => import('../pages/auth/HospitalRegister')))
// Dashboard pages
const DonorDashboard = Loadable(lazy(() => import('../pages/donor/Dashboard')))
const HospitalDashboard = Loadable(lazy(() => import('../pages/hospital/Dashboard')))

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: paths.public.home, element: <Home /> },
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
    path: paths.auth.registerDonor,
    element: <DonorRegister />,
  },
  {
    path: paths.auth.registerHospital,
    element: <HospitalRegister />,
  },
  {
    path: paths.donor.dashboard,
    element: (
      <PrivateRoute>
        <RoleRoute requiredRole="donor">
          <DonorDashboard />
        </RoleRoute>
      </PrivateRoute>
    ),
  },
  {
    path: paths.hospital.dashboard,
    element: (
      <PrivateRoute>
        <RoleRoute requiredRole="hospital">
          <HospitalDashboard />
        </RoleRoute>
      </PrivateRoute>
    ),
  },
  {
    path: paths.public.notFound,
    element: <Navigate to={paths.public.home} replace />,
  },
])
