import api from './api';

export interface RequestBloodPayload {
  quantity: number;
  bloodType: string;
  urgency: number;
  notes?: string;
}

export interface SelectDonorPayload {
  donorUserId: number;
  distance: number;
  urgency: number;
  notes?: string;
}

/**
 * Gọi API để tìm danh sách donor phù hợp (có AI scoring).
 * @param userId - userId của hospital (từ useStore)
 */
export async function requestBlood(userId: number, payload: RequestBloodPayload) {
  const response = await api.post(`/hospital/request/${userId}`, payload);
  return response.data; // { status, message, data: { urgency, mergedResults } }
}

/**
 * @param hospitalUserId - userId của hospital (từ useStore)
 */
export async function selectDonor(hospitalUserId: number, payload: SelectDonorPayload) {
  const response = await api.post(`/hospital/select-donor/${hospitalUserId}`, payload);
  return response.data;
}
