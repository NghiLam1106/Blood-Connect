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
