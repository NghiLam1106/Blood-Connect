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

export interface HospitalReportStats {
  totalRequests: number;
  acceptedRequests: number;
  pendingRequests: number;
  totalUnitBlood: number;
  acceptRate: number;
}

export async function getHospitalReports(userId: number): Promise<{ status: string; message: string; data: HospitalReportStats }> {
  const response = await api.get(`/hospital/reports/${userId}`);
  return response.data;
}

export interface NotificationHistoryItem {
  id: number;
  urgency: number;
  distance: number;
  isAccept: boolean | null;
  notes: string | null;
  createdAt: string;
}

export interface NotificationHistoryResponse {
  items: NotificationHistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getNotificationHistory(
  userId: number,
  page: number = 1,
  limit: number = 10,
  isAccept?: 'true' | 'false' | 'null',
): Promise<{ status: string; message: string; data: NotificationHistoryResponse }> {
  const params: Record<string, string> = { page: String(page), limit: String(limit) };
  if (isAccept !== undefined) params.isAccept = isAccept;
  const response = await api.get(`/hospital/notifications/${userId}`, { params });
  return response.data;
}

export interface TrendChartItem {
  date: string;
  requests: number;
  accepted: number;
}

export async function getHospitalChart(
  userId: number,
  days: number = 30,
): Promise<{ status: string; message: string; data: TrendChartItem[] }> {
  const response = await api.get(`/hospital/chart/${userId}`, { params: { days } });
  return response.data;
}

export interface BloodTypeItem {
  bloodType: string;
  count: number;
}

export async function getBloodTypeDistribution(
  userId: number,
): Promise<{ status: string; message: string; data: BloodTypeItem[] }> {
  const response = await api.get(`/hospital/blood-types/${userId}`);
  return response.data;
}
