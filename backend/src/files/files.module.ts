import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { StorageService } from './storage.service';
import { FileEntity } from '../entities/file.entity';
import { Permission } from '../entities/permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity, Permission]),
  ],
  controllers: [FilesController],
  providers: [FilesService, StorageService],
  exports: [FilesService, StorageService],
})
export class FilesModule {}
