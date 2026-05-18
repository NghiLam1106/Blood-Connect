import { useMemo } from 'react'

export function useUserInitial(name?: string | null): string {
  return useMemo(() => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    return parts.length > 0 ? parts[parts.length - 1].charAt(0).toUpperCase() : name.charAt(0).toUpperCase()
  }, [name])
}
