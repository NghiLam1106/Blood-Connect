import { InjectRedis } from '@nestjs-modules/ioredis';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Redis } from 'ioredis';
import { Server, Socket } from 'socket.io';
import { NotificationRepository } from './notification.repository';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly jwtService: JwtService,
    private readonly notificationRepository: NotificationRepository,
  ) { }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.token;

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });

      const userId: number = payload.userId;

      // Lưu mapping userId → socketId vào Redis (TTL 1 giờ)
      await this.redis.set(`socket:map:${userId}`, client.id, 'EX', 3600);

      // Gắn userId vào socket để dùng khi disconnect
      (client as any).userId = userId;

      console.log(`✅ Client connected: userId=${userId}, socketId=${client.id}`);

      // Flush các notification pending (chưa phản hồi) cho donor này
      await this.flushPendingNotifications(userId, client);
    } catch (err) {
      console.warn('❌ WebSocket auth failed:', (err as Error).message);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = (client as any).userId;
    if (userId) {
      await this.redis.del(`socket:map:${userId}`);
      console.log(`🔌 Client disconnected: userId=${userId}`);
    }
  }

  /**
   * Khi donor kết nối lại, gửi các notification đang pending (isAccept=null)
   */
  private async flushPendingNotifications(userId: number, client: Socket) {
    try {
      // Tìm donor theo userId
      const pendingNotifications = await this.notificationRepository.findPendingByDonorUserId(userId);

      if (pendingNotifications.length === 0) return;

      console.log(`📬 Gửi ${pendingNotifications.length} notification pending đến userId=${userId}`);

      for (const notification of pendingNotifications) {
        const payloadData = {
          notificationId: notification.id,
          hospitalName: notification.hospitalName,
          hospitalAddress: notification.hospitalAddress,
          distance: notification.distance,
          urgency: notification.urgency,
          unitBlood: notification.donor?.unitBlood,
          notes: notification.notes,
          requestedAt: notification.createdAt.toISOString(),
        };
        client.emit('blood-request', payloadData);
      }
    } catch (err) {
      console.warn('⚠️ Lỗi khi flush pending notifications:', (err as Error).message);
    }
  }

  /**
   * Gửi thông báo đến một user cụ thể theo userId
   */
  async sendToUser(userId: number, event: string, data: any): Promise<boolean> {
    const socketId = await this.redis.get(`socket:map:${userId}`);
    if (!socketId) {
      console.warn(`⚠️ Donor userId=${userId} không online`);
      return false;
    }

    this.server.to(socketId).emit(event, data);
    console.log(`📨 Đã gửi event "${event}" đến userId=${userId}`);
    return true;
  }
}
