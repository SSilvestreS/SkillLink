import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/multer';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ServicesModule } from './services/services.module';
import { ContractsModule } from './contracts/contracts.module';
import { MessagesModule } from './messages/messages.module';
import { FilesModule } from './files/files.module';
import { ReviewsModule } from './reviews/reviews.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentsModule } from './payments/payments.module';
import { LoggerModule } from './core/logger/logger.module';
import { CacheModule } from './core/cache/cache.module';
import { RateLimitModule } from './core/rate-limit/rate-limit.module';
import { HealthModule } from './core/health/health.module';

import { User } from './users/entities/user.entity';
import { Profile } from './users/entities/profile.entity';
import { Service } from './services/entities/service.entity';
import { Contract } from './contracts/entities/contract.entity';
import { Message } from './messages/entities/message.entity';
import { Review } from './reviews/entities/review.entity';
import { File } from './files/entities/file.entity';
import { Notification } from './notifications/entities/notification.entity';
import { Payment } from './payments/entities/payment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'skilllink',
      entities: [User, Profile, Service, Contract, Message, Review, File, Notification, Payment],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
    }),
    MulterModule.register({
      dest: './uploads',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    UsersModule,
    ServicesModule,
    ContractsModule,
    MessagesModule,
    FilesModule,
    ReviewsModule,
    NotificationsModule,
    PaymentsModule,
    LoggerModule,
    CacheModule,
    RateLimitModule,
    HealthModule,
  ],
})
export class AppModule {}
