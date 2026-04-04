import type { BloodType, MatchedDonor } from '../store/useStore'

// Vietnamese names pool
const FIRST_NAMES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ']
const MIDDLE_NAMES = ['Văn', 'Thị', 'Minh', 'Bảo', 'Anh', 'Đức', 'Thanh', 'Quốc', 'Ngọc', 'Hữu']
const LAST_NAMES = ['An', 'Bình', 'Chi', 'Dũng', 'Em', 'Hà', 'Khánh', 'Lan', 'Minh', 'Nam', 'Oanh', 'Phương', 'Quân', 'Thắng']

function randomName() {
  const fn = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]
  const mn = MIDDLE_NAMES[Math.floor(Math.random() * MIDDLE_NAMES.length)]
  const ln = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
  return `${fn} ${mn} ${ln}`
}

function randomPhone() {
  const prefixes = ['090', '091', '093', '094', '096', '097', '098', '032', '033', '034']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const rest = Math.floor(1000000 + Math.random() * 9000000)
  return `${prefix}${rest}`
}

// Blood type compatibility map (which donors can give to the request type)
const COMPATIBLE_BLOOD_TYPES: Record<BloodType, BloodType[]> = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'],
}

export interface AIMatchRequest {
  bloodType: BloodType
  radiusKm?: number
  count?: number
}

export async function runAIMatching(request: AIMatchRequest): Promise<MatchedDonor[]> {
  const { bloodType, radiusKm = 5, count = 10 } = request

  // Simulate AI processing delay
  await new Promise((r) => setTimeout(r, 2000 + Math.random() * 1000))

  const compatibleTypes = COMPATIBLE_BLOOD_TYPES[bloodType]
  const donors: MatchedDonor[] = []

  for (let i = 0; i < count; i++) {
    const donorBloodType = compatibleTypes[Math.floor(Math.random() * compatibleTypes.length)]
    const distance = parseFloat((0.3 + Math.random() * (radiusKm - 0.3)).toFixed(1))
    const estimatedArrival = Math.round(distance * 4 + Math.random() * 5) // ~4 min/km

    donors.push({
      id: `donor-${Date.now()}-${i}`,
      name: randomName(),
      phone: randomPhone(),
      bloodType: donorBloodType,
      distance,
      status: 'pending',
      estimatedArrival,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + Date.now()}`,
    })
  }

  // Sort by distance
  donors.sort((a, b) => a.distance - b.distance)

  console.log(`[MockAI] Tìm thấy ${donors.length} người hiến phù hợp với nhóm ${bloodType}`)
  return donors
}

// Simulate donor responding to alert (randomly confirms after some time)
export function simulateDonorResponse(
  donorId: string,
  onUpdate: (id: string, status: 'confirmed' | 'arrived') => void
): () => void {
  const confirmTimeout = setTimeout(() => {
    onUpdate(donorId, 'confirmed')
    const arrivalTimeout = setTimeout(() => {
      onUpdate(donorId, 'arrived')
    }, 5000 + Math.random() * 8000)
    return () => clearTimeout(arrivalTimeout)
  }, 3000 + Math.random() * 6000)

  return () => clearTimeout(confirmTimeout)
}
