import { useCallback } from 'react';
import type { DonorStatus } from '../store/useStore';
import { useStore } from '../store/useStore';
import { useSocket } from './useSocket';

interface DonorResponsePayload {
  action: 'accept' | 'reject';
  donorUserId: number;
  donorName: string;
  donorPhone: string;
  message: string;
}

export const useDonorResponse = () => {
  const { updateDonorStatus } = useStore();

  const handleDonorResponse = useCallback(
    (data: DonorResponsePayload) => {
      const newStatus: DonorStatus = data.action === 'accept' ? 'confirmed' : 'rejected';
      updateDonorStatus(data.donorUserId, newStatus);
    },
    [updateDonorStatus],
  );

  useSocket('donor-response', handleDonorResponse);
};
