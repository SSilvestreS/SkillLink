import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';

import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { File } from './entities/file.entity';
import { UsersModule } from '../users/users.module';
import { ContractsModule } from '../contracts/contracts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    MulterModule.register({
      dest: './uploads',
    }),
    UsersModule,
    ContractsModule,
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
