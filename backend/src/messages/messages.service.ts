import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async create(createMessageDto: CreateMessageDto, senderId: string): Promise<Message> {
    const message = this.messageRepository.create({
      ...createMessageDto,
      senderId,
    });

    return this.messageRepository.save(message);
  }

  async findByContract(contractId: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: { contractId },
      relations: ['sender', 'receiver'],
      order: { createdAt: 'ASC' },
    });
  }

  async markAsRead(messageId: string, userId: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Mensagem não encontrada');
    }

    if (message.receiverId !== userId) {
      throw new ForbiddenException('Você só pode marcar suas próprias mensagens como lidas');
    }

    message.isRead = true;
    message.readAt = new Date();

    return this.messageRepository.save(message);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.messageRepository.count({
      where: { receiverId: userId, isRead: false },
    });
  }
}
