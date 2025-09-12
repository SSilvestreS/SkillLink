import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '../cache/cache.module';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';

@Module({
  imports: [CacheModule, TypeOrmModule],
  providers: [HealthService],
  controllers: [HealthController],
  exports: [HealthService],
})
export class HealthModule {}
