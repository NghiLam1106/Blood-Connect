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
