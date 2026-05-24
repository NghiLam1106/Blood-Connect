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
