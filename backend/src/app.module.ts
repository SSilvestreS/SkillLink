import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
// import { join } from 'path'; // Removido - não utilizado

// Declaração de tipo para __dirname - removido pois não utilizado
// declare const __dirname: string;

import { databaseConfig } from './config/database.config';

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


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: databaseConfig,
      inject: [ConfigService],
    }),
    MulterModule.register({
      dest: './uploads',
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
