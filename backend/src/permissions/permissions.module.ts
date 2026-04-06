import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { Permission } from '../entities/permission.entity';
import { User } from '../entities/user.entity';
import { Folder } from '../entities/folder.entity';
import { FileEntity } from '../entities/file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Permission, User, Folder, FileEntity])],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
