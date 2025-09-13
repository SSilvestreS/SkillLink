import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Profile } from '../users/entities/profile.entity';
import { Service } from '../services/entities/service.entity';
import { Contract } from '../contracts/entities/contract.entity';
import { Message } from '../messages/entities/message.entity';
import { Review } from '../reviews/entities/review.entity';
import { File } from '../files/entities/file.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { Payment } from '../payments/entities/payment.entity';

export const databaseConfig = (configService: ConfigService) => ({
  type: 'postgres' as const,
  host: configService.get('DB_HOST', 'localhost'),
  port: parseInt(configService.get('DB_PORT', '5432')),
  username: configService.get('DB_USERNAME', 'postgres'),
  password: configService.get('DB_PASSWORD', 'postgres'),
  database: configService.get('DB_DATABASE', 'skilllink'),
  entities: [User, Profile, Service, Contract, Message, Review, File, Notification, Payment],
  synchronize: configService.get('NODE_ENV') === 'development',
  logging: configService.get('NODE_ENV') === 'development',
  ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
  extra: {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
});
