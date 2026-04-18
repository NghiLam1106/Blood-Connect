import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { paths } from './paths'

export function RoleRoute({ children, requiredRole }: { children: ReactNode, requiredRole: string }) {
  const { user } = useStore()

  if (user?.role !== requiredRole) {
    return <Navigate to={paths.public.home} replace />
  }

  return <>{children}</>
}
