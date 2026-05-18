import { useState } from 'react'
import { updateDonorProfile } from '../services/donor.service'
import { useStore } from '../store/useStore'

export function useDonorAvailability() {
  const { user, isAvailable, setAvailable, updateUser } = useStore()
  const [isToggling, setIsToggling] = useState(false)

  const toggle = async (next: boolean) => {
    if (!user?.id || isToggling) return
    setAvailable(next)
    setIsToggling(true)
    try {
      await updateDonorProfile(user.id, { status: next ? 'AVAILABLE' : 'UNAVAILABLE' })
      updateUser({ status: next ? 'AVAILABLE' : 'UNAVAILABLE' })
    } catch {
      setAvailable(!next)
    } finally {
      setIsToggling(false)
    }
  }

  return { isAvailable, isToggling, toggle }
}
