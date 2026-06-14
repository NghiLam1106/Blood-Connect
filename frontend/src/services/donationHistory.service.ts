import api from './api';

export type DonationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface DonationHistory {
  id: number;
  donorId: number;
  hospitalId: number;
  donationDate: string;
  status: DonationStatus;
  donor: {
    id: number;
    bloodType: string;
    user: { id: number; name: string };
  };
}

export interface DonationHistoryForDonor {
  id: number;
  donorId: number;
  hospitalId: number;
  bloodType: string;
  unitBlood: number;
  donationDate: string;
  notes?: string;
  status: DonationStatus;
  hospital: {
    id: number;
    user: { name: string };
  };
}

export async function getHospitalDonationHistory(hospitalUserId: number) {
  const response = await api.get(`/donation-history/get-donation-history-by-hospital/${hospitalUserId}`);
  return response.data;
}

export async function getDonorDonationHistory(donorUserId: number) {
  const response = await api.get(`/donation-history/get-donation-history-by-donor/${donorUserId}`);
  return response.data;
}

export async function updateDonationStatus(id: number, status: 'ACCEPTED' | 'REJECTED') {
  const response = await api.put(`/donation-history/update-donation-status/${id}`, { status });
  return response.data;
}
