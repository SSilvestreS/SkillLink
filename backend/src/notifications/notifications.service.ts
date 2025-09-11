import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Notification, NotificationType, NotificationStatus } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';

export interface CreateNotificationDto {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  data?: any;
  actionUrl?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      data: createNotificationDto.data ? JSON.stringify(createNotificationDto.data) : null,
    });

    const savedNotification = await this.notificationRepository.save(notification);

    // Send real-time notification
    await this.notificationsGateway.sendToUser(createNotificationDto.userId, {
      id: savedNotification.id,
      title: savedNotification.title,
      message: savedNotification.message,
      type: savedNotification.type,
      createdAt: savedNotification.createdAt,
      actionUrl: savedNotification.actionUrl,
    });

    return savedNotification;
  }

  async findByUser(userId: string, page = 1, limit = 20): Promise<{
    notifications: Notification[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: {
        userId,
        status: NotificationStatus.UNREAD,
      },
    });
  }

  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notificação não encontrada');
    }

    notification.status = NotificationStatus.READ;
    notification.readAt = new Date();

    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      {
        userId,
        status: NotificationStatus.UNREAD,
      },
      {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    );
  }

  async delete(notificationId: string, userId: string): Promise<void> {
    const result = await this.notificationRepository.delete({
      id: notificationId,
      userId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Notificação não encontrada');
    }
  }

  // Helper methods for specific notification types
  async notifyNewMessage(userId: string, contractId: string, senderName: string): Promise<void> {
    await this.create({
      userId,
      title: 'Nova mensagem',
      message: `${senderName} enviou uma mensagem no contrato`,
      type: NotificationType.NEW_MESSAGE,
      data: { contractId, senderName },
      actionUrl: `/messages/${contractId}`,
    });
  }

  async notifyNewContract(userId: string, contractTitle: string, companyName: string): Promise<void> {
    await this.create({
      userId,
      title: 'Novo contrato',
      message: `${companyName} criou um novo contrato: ${contractTitle}`,
      type: NotificationType.NEW_CONTRACT,
      data: { contractTitle, companyName },
      actionUrl: '/contracts',
    });
  }

  async notifyContractAccepted(userId: string, contractTitle: string, freelancerName: string): Promise<void> {
    await this.create({
      userId,
      title: 'Contrato aceito',
      message: `${freelancerName} aceitou o contrato: ${contractTitle}`,
      type: NotificationType.CONTRACT_ACCEPTED,
      data: { contractTitle, freelancerName },
      actionUrl: '/contracts',
    });
  }

  async notifyPaymentReceived(userId: string, amount: number, contractTitle: string): Promise<void> {
    await this.create({
      userId,
      title: 'Pagamento recebido',
      message: `Você recebeu R$ ${amount.toFixed(2)} pelo contrato: ${contractTitle}`,
      type: NotificationType.PAYMENT_RECEIVED,
      data: { amount, contractTitle },
      actionUrl: '/contracts',
    });
  }

  async notifyReviewReceived(userId: string, rating: number, reviewerName: string): Promise<void> {
    await this.create({
      userId,
      title: 'Nova avaliação',
      message: `${reviewerName} avaliou você com ${rating} estrelas`,
      type: NotificationType.REVIEW_RECEIVED,
      data: { rating, reviewerName },
      actionUrl: '/profile',
    });
  }
}
