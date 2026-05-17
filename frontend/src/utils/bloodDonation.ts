export const MIN_WEIGHT_MALE = 45
export const MIN_WEIGHT_FEMALE = 42
export const MAX_DONATION_ML = 450
export const ML_PER_KG = 9

export function isEligibleByWeight(weight: number, gender: 'MALE' | 'FEMALE'): boolean {
  const min = gender === 'MALE' ? MIN_WEIGHT_MALE : MIN_WEIGHT_FEMALE
  return weight >= min
}

export function getMaxDonation(weight: number): number {
  return Math.min(Math.floor((weight * ML_PER_KG) / 50) * 50, MAX_DONATION_ML)
}

export function getSuggestedAmount(weight: number, gender: 'MALE' | 'FEMALE'): number | null {
  if (!isEligibleByWeight(weight, gender)) return null
  if (weight < 45) return 250
  if (weight < 50) return 350
  return 450
}

export function getValidOptions(weight: number, gender: 'MALE' | 'FEMALE'): number[] {
  if (!isEligibleByWeight(weight, gender)) return []
  if (weight < 45) return [250]
  if (weight < 50) return [250, 350]
  return [250, 350, 450]
}

export function getAgeFromDOB(dob: Date): number {
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
  return age
}
