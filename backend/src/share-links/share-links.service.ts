import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  GoneException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ShareLink } from '../entities/share-link.entity';
import { Folder } from '../entities/folder.entity';
import { FileEntity } from '../entities/file.entity';
import { CreateShareLinkDto } from './dto/create-share-link.dto';

@Injectable()
export class ShareLinksService {
  constructor(
    @InjectRepository(ShareLink)
    private readonly shareLinkRepo: Repository<ShareLink>,
    @InjectRepository(Folder)
    private readonly folderRepo: Repository<Folder>,
    @InjectRepository(FileEntity)
    private readonly fileRepo: Repository<FileEntity>,
  ) {}

  async create(dto: CreateShareLinkDto, userId: string) {
    await this.checkOwnership(dto.resourceType, dto.resourceId, userId);

    const existing = await this.shareLinkRepo.findOne({
      where: {
        resourceType: dto.resourceType,
        resourceId: dto.resourceId,
        createdById: userId,
      },
    });

    if (existing) return existing;

    const shareLink = this.shareLinkRepo.create({
      resourceType: dto.resourceType,
      resourceId: dto.resourceId,
      token: uuidv4(),
      createdById: userId,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    });

    return this.shareLinkRepo.save(shareLink);
  }

  async getByToken(token: string) {
    const shareLink = await this.shareLinkRepo.findOne({
      where: { token },
      relations: ['createdBy'],
    });

    if (!shareLink) throw new NotFoundException('Share link not found');

    if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
      throw new GoneException('Share link has expired');
    }

    if (shareLink.resourceType === 'folder') {
      const folder = await this.folderRepo.findOne({
        where: { id: shareLink.resourceId },
        relations: ['owner'],
      });
      if (!folder) throw new NotFoundException('Folder not found');

      const children = await this.folderRepo.find({
        where: { parentId: folder.id },
        order: { position: 'ASC' },
      });

      const files = await this.fileRepo.find({
        where: { folderId: folder.id },
        order: { position: 'ASC' },
      });

      return { shareLink, resource: { folder, children, files } };
    } else {
      const file = await this.fileRepo.findOne({
        where: { id: shareLink.resourceId },
        relations: ['owner'],
      });
      if (!file) throw new NotFoundException('File not found');

      return { shareLink, resource: { file } };
    }
  }

  async remove(id: string, userId: string) {
    const shareLink = await this.shareLinkRepo.findOne({ where: { id } });
    if (!shareLink) throw new NotFoundException('Share link not found');
    if (shareLink.createdById !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    await this.shareLinkRepo.remove(shareLink);
    return { message: 'Share link deleted successfully' };
  }

  async getForResource(
    resourceType: 'file' | 'folder',
    resourceId: string,
    userId: string,
  ) {
    return this.shareLinkRepo.findOne({
      where: { resourceType, resourceId, createdById: userId },
    });
  }

  private async checkOwnership(
    resourceType: 'file' | 'folder',
    resourceId: string,
    userId: string,
  ) {
    if (resourceType === 'folder') {
      const folder = await this.folderRepo.findOne({
        where: { id: resourceId },
      });
      if (!folder) throw new NotFoundException('Folder not found');
      if (folder.ownerId !== userId) {
        throw new ForbiddenException('Only the owner can share this resource');
      }
    } else {
      const file = await this.fileRepo.findOne({
        where: { id: resourceId },
      });
      if (!file) throw new NotFoundException('File not found');
      if (file.ownerId !== userId) {
        throw new ForbiddenException('Only the owner can share this resource');
      }
    }
  }
}
