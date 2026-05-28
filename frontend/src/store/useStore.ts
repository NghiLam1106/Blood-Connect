import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { storage } from '../utils/localStorage'

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'donor' | 'hospital' | 'admin' | 'guest'
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
export type DonorStatus = 'pending' | 'confirmed' | 'arrived' | 'rejected'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  bloodType?: BloodType
  avatar?: string
  totalDonations?: number
  lastDonation?: string
  address?: string
  provinceName?: string
  wardName?: string
  street?: string
  dob?: string
  dobVerified?: boolean
  gender?: 'MALE' | 'FEMALE'
  weight?: number
  unitBlood?: number
  status?: 'AVAILABLE' | 'UNAVAILABLE'
}

export interface MatchedDonor {
  id: number           // donor record id
  userId: number       // userId của donor (dùng để gọi selectDonor)
  name: string
  phone: string
  bloodType: BloodType
  distance: number     // km
  status: DonorStatus
  estimatedArrival?: number // minutes
  avatar?: string
}

export interface EmergencyAlert {
  id: string
  notificationId: number   // id của notification trong DB, dùng để gọi PATCH /notifications/:id/respond
  bloodType?: string
  hospitalName: string
  hospitalAddress: string
  distance: number
  urgencyLevel: number
  mapsUrl: string
}

export interface EmergencyRequest {
  bloodType: BloodType
  quantity: number
  urgencyLevel: number
  notes?: string
}

// ─── Auth Slice ───────────────────────────────────────────────────────────────

interface AuthSlice {
  user: User | null
  isAuthenticated: boolean
  isReady: boolean
  authModalView: string | null
  setAuthModalView: (view: string | null) => void
  login: (user: User) => void
  updateUser: (updates: Partial<User>) => void
  logout: () => void
}

// ─── Emergency Slice ──────────────────────────────────────────────────────────

interface EmergencySlice {
  // Donor side
  isAvailable: boolean
  activeAlert: EmergencyAlert | null
  setAvailable: (val: boolean) => void
  setActiveAlert: (alert: EmergencyAlert | null) => void
  confirmSupport: () => void

  // Hospital side
  currentRequest: EmergencyRequest | null
  matchedDonors: MatchedDonor[]
  isSearching: boolean
  setCurrentRequest: (req: EmergencyRequest | null) => void
  setMatchedDonors: (donors: MatchedDonor[]) => void
  setIsSearching: (val: boolean) => void
  updateDonorStatus: (donorId: number, status: DonorStatus) => void
}

// ─── Location Slice ───────────────────────────────────────────────────────────

interface LocationSlice {
  userCoords: { lat: number; lng: number } | null
  setUserCoords: (coords: { lat: number; lng: number } | null) => void
}

// ─── Combined Store ───────────────────────────────────────────────────────────

type AppStore = AuthSlice & EmergencySlice & LocationSlice

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      // Auth
      user: null,
      isAuthenticated: false,
      isReady: false,
      authModalView: null,
      setAuthModalView: (view) => set({ authModalView: view }),
      login: (user) => set({ user, isAuthenticated: true, isReady: true, authModalView: null }),
      updateUser: (updates) =>
        set((state) => {
          const { id, ...safeUpdates } = updates;

          return {
            user: state.user
              ? { ...state.user, ...safeUpdates }
              : state.user,
          };
        }),
      logout: () => {
        storage.clearAuth();
        set({
          user: null,
          isAuthenticated: false,
          activeAlert: null,
          currentRequest: null,
          matchedDonors: [],
          authModalView: null,
        })
      },

      // Emergency – Donor side
      isAvailable: false,
      activeAlert: null,
      setAvailable: (val) => set({ isAvailable: val }),
      setActiveAlert: (alert) => set({ activeAlert: alert }),
      confirmSupport: () =>
        set((state) => ({
          activeAlert: state.activeAlert
            ? { ...state.activeAlert }
            : null,
        })),

      // Emergency – Hospital side
      currentRequest: null,
      matchedDonors: [],
      isSearching: false,
      setCurrentRequest: (req) => set({ currentRequest: req }),
      setMatchedDonors: (donors) => set({ matchedDonors: donors }),
      setIsSearching: (val) => set({ isSearching: val }),
      updateDonorStatus: (donorId, status) =>
        set((state) => ({
          matchedDonors: state.matchedDonors.map((d) =>
            d.id === donorId ? { ...d, status } : d
          ),
        })),

      // Location
      userCoords: null,
      setUserCoords: (coords) => set({ userCoords: coords }),
    }),
    {
      name: 'blood-connect-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAvailable: state.isAvailable,
      }),
    }
  )
)
