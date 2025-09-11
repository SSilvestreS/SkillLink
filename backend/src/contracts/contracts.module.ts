import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { Contract } from './entities/contract.entity';
import { UsersModule } from '../users/users.module';
import { ServicesModule } from '../services/services.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contract]),
    UsersModule,
    ServicesModule,
  ],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}
