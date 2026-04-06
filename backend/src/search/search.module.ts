import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { Folder } from '../entities/folder.entity';
import { FileEntity } from '../entities/file.entity';
import { Permission } from '../entities/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Folder, FileEntity, Permission])],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
