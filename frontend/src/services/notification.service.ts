import api from './api';

export interface BloodRequestNotification {
  id: number;
  donorId: number;
  hospitalId: number;
  hospitalName: string;
  hospitalAddress: string | null;
  distance: number;
  urgency: number;
  notes: string | null;
  isAccept: boolean | null;
  createdAt: string;
  hospital?: {
    user?: {
      name: string;
      address: string | null;
      phone: string;
    };
  };
}

/**
 * Donor lấy danh sách thông báo của mình
 * GET /notifications/donor
 */
export const getMyNotifications = async (): Promise<BloodRequestNotification[]> => {
  const response = await api.get('/notifications/donor');
  return response.data.data;
};

/**
 * Donor phản hồi yêu cầu hiến máu (chấp nhận / từ chối)
 * POST /donors/respond-donor
 * action: 'accept' | 'reject'
 */
export const respondToNotification = async (
  notificationId: number,
  donorUserId: number,
  action: 'accept' | 'reject',
): Promise<void> => {
  await api.post('/donors/respond-donor', { notificationId, donorUserId, action });
};
