import { io, Socket } from 'socket.io-client';
import { storage } from '../utils/localStorage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    // Only connect if there's no active socket connection
    if (!this.socket || !this.socket.connected) {
      const token = storage.getToken();
      if (!token) {
        console.warn('Socket connection failed: No access token found');
        return;
      }

      this.socket = io(API_URL, {
        auth: {
          token
        },
        transports: ['websocket'],
      });

      this.socket.on('connect', () => {
        console.log('🔗 WebSocket Connected: ', this.socket?.id);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ WebSocket Connection Error: ', error.message);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 WebSocket Disconnected: ', reason);
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
