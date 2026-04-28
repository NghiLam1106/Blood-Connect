import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { paths } from './paths'

export function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={paths.public.home} state={{ from: location }} replace />
  }

  return <>{children}</>
}
