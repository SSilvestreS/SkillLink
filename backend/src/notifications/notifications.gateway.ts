import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
// import { UseGuards } from '@nestjs/common'; // Removido - não utilizado
import { JwtService } from '@nestjs/jwt';

import { NotificationsService } from './notifications.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Removido - não utilizado

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:8080', 'http://localhost:3000'],
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private notificationsService: NotificationsService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      this.connectedUsers.set(userId, client.id);
      client.data.userId = userId;

      // Join user to their personal room
      client.join(`user_${userId}`);

      // Send unread notifications count
      const unreadCount = await this.notificationsService.getUnreadCount(userId);
      client.emit('unread_count', { count: unreadCount });

      console.log(`User ${userId} connected with socket ${client.id}`);
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.connectedUsers.delete(userId);
      console.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('join_contract')
  async handleJoinContract(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { contractId: string },
  ) {
    const userId = client.data.userId;
    if (userId) {
      client.join(`contract_${data.contractId}`);
      console.log(`User ${userId} joined contract ${data.contractId}`);
    }
  }

  @SubscribeMessage('leave_contract')
  async handleLeaveContract(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { contractId: string },
  ) {
    client.leave(`contract_${data.contractId}`);
    console.log(`User left contract ${data.contractId}`);
  }

  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: string },
  ) {
    const userId = client.data.userId;
    if (userId) {
      await this.notificationsService.markAsRead(data.notificationId, userId);
      
      // Send updated unread count
      const unreadCount = await this.notificationsService.getUnreadCount(userId);
      client.emit('unread_count', { count: unreadCount });
    }
  }

  // Method to send notification to specific user
  async sendToUser(userId: string, notification: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('new_notification', notification);
    }
  }

  // Method to send notification to contract participants
  async sendToContract(contractId: string, notification: any, excludeUserId?: string) {
    this.server.to(`contract_${contractId}`).emit('contract_notification', {
      ...notification,
      contractId,
    });
  }

  // Method to broadcast to all connected users
  async broadcast(notification: any) {
    this.server.emit('broadcast_notification', notification);
  }
}
