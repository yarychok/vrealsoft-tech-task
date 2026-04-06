import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from '../entities/file.entity';
import { Permission } from '../entities/permission.entity';
import { StorageService } from './storage.service';
import { UpdateFileDto } from './dto/update-file.dto';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepo: Repository<FileEntity>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
    private readonly storageService: StorageService,
  ) {}

  async upload(
    file: Express.Multer.File,
    ownerId: string,
    folderId?: string,
    isPublic: boolean = false,
  ) {
    const { path: storagePath, size } = await this.storageService.saveFile(
      file,
      ownerId,
    );

    const qb = this.fileRepo
      .createQueryBuilder('file')
      .select('MAX(file.position)', 'max');

    if (folderId) {
      qb.where('file.folder_id = :folderId', { folderId });
    } else {
      qb.where('file.folder_id IS NULL');
    }

    const maxPosition = await qb
      .andWhere('file.owner_id = :ownerId', { ownerId })
      .getRawOne();

    const fileEntity = this.fileRepo.create({
      name: file.originalname,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size,
      storagePath,
      folderId: folderId || null,
      ownerId,
      isPublic,
      position: (maxPosition?.max ?? -1) + 1,
    });

    return this.fileRepo.save(fileEntity);
  }

  async findOne(id: string, userId: string | null) {
    const file = await this.fileRepo.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!file) throw new NotFoundException('File not found');

    if (!file.isPublic) {
      if (!userId) throw new ForbiddenException('Access denied');
      await this.checkAccess(file, userId, 'viewer');
    }

    return file;
  }

  async download(id: string, userId: string | null) {
    const file = await this.findOne(id, userId);
    const fullPath = this.storageService.getFullPath(file.storagePath);
    return { file, fullPath };
  }

  async update(id: string, dto: UpdateFileDto, userId: string) {
    const file = await this.fileRepo.findOne({ where: { id } });
    if (!file) throw new NotFoundException('File not found');
    await this.checkAccess(file, userId, 'editor');

    Object.assign(file, dto);
    return this.fileRepo.save(file);
  }

  async remove(id: string, userId: string) {
    const file = await this.fileRepo.findOne({ where: { id } });
    if (!file) throw new NotFoundException('File not found');
    await this.checkAccess(file, userId, 'editor');

    await this.storageService.deleteFile(file.storagePath);

    await this.fileRepo.remove(file);
    return { message: 'File deleted successfully' };
  }

  async clone(id: string, userId: string) {
    const file = await this.fileRepo.findOne({ where: { id } });
    if (!file) throw new NotFoundException('File not found');
    await this.checkAccess(file, userId, 'viewer');

    const clone = this.fileRepo.create({
      name: `${file.name} (Copy)`,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      storagePath: file.storagePath,
      folderId: file.folderId,
      ownerId: userId,
      isPublic: false,
      position: file.position,
    });

    return this.fileRepo.save(clone);
  }

  async reorder(items: { id: string; position: number }[], userId: string) {
    for (const item of items) {
      await this.fileRepo.update(
        { id: item.id, ownerId: userId },
        { position: item.position },
      );
    }
    return { message: 'Reordered successfully' };
  }

  private async checkAccess(
    file: FileEntity,
    userId: string,
    requiredLevel: 'viewer' | 'editor',
  ) {
    if (file.ownerId === userId) return;

    const permission = await this.permissionRepo.findOne({
      where: {
        resourceType: 'file',
        resourceId: file.id,
        userId,
      },
    });

    if (!permission && file.folderId) {
      const folderPermission = await this.permissionRepo.findOne({
        where: {
          resourceType: 'folder',
          resourceId: file.folderId,
          userId,
        },
      });
      if (folderPermission) {
        if (
          requiredLevel === 'editor' &&
          folderPermission.permission !== 'editor'
        ) {
          throw new ForbiddenException(
            'You need editor access for this action',
          );
        }
        return;
      }
    }

    if (!permission) {
      throw new ForbiddenException('You do not have access to this file');
    }

    if (requiredLevel === 'editor' && permission.permission !== 'editor') {
      throw new ForbiddenException('You need editor access for this action');
    }
  }
}
