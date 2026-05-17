import { useEffect } from 'react';
import { socketService } from '../services/socket';

/**
 * Custom hook to listen to socket events.
 *
 * @param eventName The event to listen to
 * @param callback The callback to execute when the event is received
 */
export const useSocket = (eventName: string, callback: (...args: any[]) => void) => {
  useEffect(() => {
    const socket = socketService.getSocket();

    if (!socket) {
      // It's possible the socket hasn't initialized yet if this component mounts very early
      // Or if the user is not authenticated
      return;
    }

    socket.on(eventName, callback);

    return () => {
      socket.off(eventName, callback);
    };
  }, [eventName, callback]);
};
