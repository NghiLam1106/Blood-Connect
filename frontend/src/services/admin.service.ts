import api from './api';

export interface AdminStats {
  totalDonors: number;
  totalBloodUnits: {
    _sum: {
      unitBlood: number;
    }
  };
  totalHospitals: number;
  todayConnections: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const response = await api.get('/admin/stats');
  return response.data.data;
}

export interface DemandChartItem {
  date: string;
  requests: number;
  responses: number;
}

export async function getDemandChart(days: number): Promise<DemandChartItem[]> {
  const response = await api.get(`/admin/stats/demand-chart?days=${days}`);
  return response.data.data;
}

export interface RecentTrafficItem {
  id: number;
  hospitalName: string;
  bloodType: string;
  createdAt: string;
  status: 'Đã xử lý' | 'Khẩn cấp' | 'Bình thường' | 'Từ chối';
}

export async function getRecentTraffic(limit = 5): Promise<RecentTrafficItem[]> {
  const response = await api.get(`/admin/recent-traffic?limit=${limit}`);
  return response.data.data;
}

export interface HospitalsTrafficItem {
  id: number;
  hospitalName: string;
  bloodType: string;
  urgency: number;
  createdAt: string;
  status: string;
}

export interface HospitalsTrafficResponse {
  data: HospitalsTrafficItem[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getHospitalsTraffic(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  bloodType?: string;
}): Promise<HospitalsTrafficResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);
  if (params.bloodType) query.set('bloodType', params.bloodType);
  const response = await api.get(`/admin/hospitals-traffic?${query.toString()}`);
  return response.data.data;
}

export interface HospitalItem {
  userId: number;
  hospitalId: number;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  licenseCode: string | null;
  licenseFile: string | null;
  isVerified: boolean;
  createdAt: string;
}

export interface HospitalsResponse {
  data: HospitalItem[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getHospitals(params: {
  page?: number;
  limit?: number;
  search?: string;
  isVerified?: boolean;
}): Promise<HospitalsResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.search) query.set('search', params.search);
  if (params.isVerified !== undefined) query.set('isVerified', String(params.isVerified));
  const response = await api.get(`/admin/hospitals?${query.toString()}`);
  return response.data.data;
}

export async function verifyHospital(userId: number, isVerified: boolean): Promise<void> {
  await api.patch(`/admin/hospitals/${userId}/verify`, { isVerified });
}

export interface DonorItem {
  userId: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  avatar: string | null;
  bloodType: string;
  status: 'AVAILABLE' | 'UNAVAILABLE';
  responseRate: number | null;
  lastDonation: string | null;
  totalDonations: number;
  createdAt: string;
}

export interface DonorsResponse {
  data: DonorItem[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getDonors(params: {
  page?: number;
  limit?: number;
  search?: string;
  bloodType?: string;
  status?: string;
}): Promise<DonorsResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.search) query.set('search', params.search);
  if (params.bloodType) query.set('bloodType', params.bloodType);
  if (params.status) query.set('status', params.status);
  const response = await api.get(`/admin/donors?${query.toString()}`);
  return response.data.data;
}

export interface DonorHistory {
  id: number;
  bloodType: string;
  unitBlood: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  donationDate: string;
  notes: string | null;
  hospitalName: string;
}

export interface DonorDetailResponse {
  donor: DonorItem & { id: number; weight: number | null; dob: string | null; gender: string | null; unitBlood: number | null };
  histories: DonorHistory[];
}

export async function getDonorDetail(userId: number): Promise<DonorDetailResponse> {
  const response = await api.get(`/admin/donors/${userId}`);
  return response.data.data;
}
