import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CircularProgress, Box } from '@mui/material'
import { MainLayout } from './layouts/MainLayout'
import { useStore } from './store/useStore'

// Lazy loaded pages
const Home = lazy(() => import('./pages/Home'))
const AuthSelect = lazy(() => import('./pages/auth/AuthSelect'))
const Login = lazy(() => import('./pages/auth/Login'))
const DonorRegister = lazy(() => import('./pages/auth/DonorRegister'))
const HospitalRegister = lazy(() => import('./pages/auth/HospitalRegister'))
const DonorDashboard = lazy(() => import('./pages/donor/DonorDashboard'))
const HospitalDashboard = lazy(() => import('./pages/hospital/HospitalDashboard'))

function LoadingFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress sx={{ color: '#dc2626' }} />
    </Box>
  )
}

// Protected route wrapper
function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  const { isAuthenticated, user } = useStore()

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes with MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
          </Route>

          {/* Auth routes (no main layout footer) */}
          <Route path="/auth" element={<AuthSelect />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register/donor" element={<DonorRegister />} />
          <Route path="/auth/register/hospital" element={<HospitalRegister />} />

          {/* Donor dashboard */}
          <Route
            path="/donor/dashboard"
            element={
              <ProtectedRoute requiredRole="donor">
                <DonorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Hospital dashboard */}
          <Route
            path="/hospital/dashboard"
            element={
              <ProtectedRoute requiredRole="hospital">
                <HospitalDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
