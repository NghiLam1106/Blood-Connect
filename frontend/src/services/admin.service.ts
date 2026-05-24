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
