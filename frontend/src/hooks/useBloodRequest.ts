import { useCallback } from 'react';
import { useStore } from '../store/useStore';
import { useSocket } from './useSocket';

interface BloodRequestPayload {
  notificationId: number;
  hospitalName: string;
  hospitalAddress: string;
  distance: number;
  urgency: number;
  unitBlood: number;
  notes?: string | null;
  requestedAt: string;
}

/**
 * Hook lắng nghe event 'blood-request' từ WebSocket.
 * Khi nhận được, tự động set activeAlert vào Zustand store
 * để EmergencyAlertBanner hiển thị ngay lập tức.
 *
 * Gọi hook này ở DashboardLayout (donor) để luôn lắng nghe khi đăng nhập.
 */
export const useBloodRequest = () => {
  const { setActiveAlert } = useStore();

  const handleBloodRequest = useCallback(
    (data: BloodRequestPayload) => {
      // Deduplicate: nếu alert hiện tại đã là notification này → bỏ qua
      const currentAlert = useStore.getState().activeAlert;
      if (currentAlert?.notificationId === data.notificationId) return;

      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        data.hospitalAddress,
      )}`;

      setActiveAlert({
        id: String(data.notificationId),
        notificationId: data.notificationId,
        hospitalName: data.hospitalName,
        hospitalAddress: data.hospitalAddress,
        distance: data.distance,
        urgencyLevel: data.urgency,
        mapsUrl,
      });
    },
    [setActiveAlert],
  );

  useSocket('blood-request', handleBloodRequest);
};
