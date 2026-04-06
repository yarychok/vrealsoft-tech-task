import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShareLinksController } from './share-links.controller';
import { ShareLinksService } from './share-links.service';
import { ShareLink } from '../entities/share-link.entity';
import { Folder } from '../entities/folder.entity';
import { FileEntity } from '../entities/file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShareLink, Folder, FileEntity])],
  controllers: [ShareLinksController],
  providers: [ShareLinksService],
  exports: [ShareLinksService],
})
export class ShareLinksModule {}
