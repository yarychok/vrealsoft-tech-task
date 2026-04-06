import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Folder } from '../entities/folder.entity';
import { FileEntity } from '../entities/file.entity';
import { Permission } from '../entities/permission.entity';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';

@Injectable()
export class FoldersService {
  constructor(
    @InjectRepository(Folder)
    private readonly folderRepo: Repository<Folder>,
    @InjectRepository(FileEntity)
    private readonly fileRepo: Repository<FileEntity>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  async create(dto: CreateFolderDto, ownerId: string) {
    if (dto.parentId) {
      const parent = await this.folderRepo.findOne({
        where: { id: dto.parentId },
      });
      if (!parent) throw new NotFoundException('Parent folder not found');
      await this.checkAccess(parent, ownerId, 'editor');
    }

    const qb = this.folderRepo
      .createQueryBuilder('folder')
      .select('MAX(folder.position)', 'max');

    if (dto.parentId) {
      qb.where('folder.parent_id = :parentId', { parentId: dto.parentId });
    } else {
      qb.where('folder.parent_id IS NULL');
    }

    const maxPosition = await qb
      .andWhere('folder.owner_id = :ownerId', { ownerId })
      .getRawOne();

    const folder = this.folderRepo.create({
      name: dto.name,
      parentId: dto.parentId || null,
      ownerId,
      isPublic: dto.isPublic || false,
      position: (maxPosition?.max ?? -1) + 1,
    });

    return this.folderRepo.save(folder);
  }

  async getRootContents(userId: string | null) {
    const folders = userId
      ? await this.folderRepo.find({
          where: [
            { ownerId: userId, parentId: IsNull() },
            { isPublic: true, parentId: IsNull() },
          ],
          order: { position: 'ASC' },
          relations: ['owner'],
        })
      : await this.folderRepo.find({
          where: { isPublic: true, parentId: IsNull() },
          order: { position: 'ASC' },
          relations: ['owner'],
        });

    const files = userId
      ? await this.fileRepo.find({
          where: [
            { ownerId: userId, folderId: IsNull() },
            { isPublic: true, folderId: IsNull() },
          ],
          order: { position: 'ASC' },
          relations: ['owner'],
        })
      : await this.fileRepo.find({
          where: { isPublic: true, folderId: IsNull() },
          order: { position: 'ASC' },
          relations: ['owner'],
        });

    const sharedPermissions = userId
      ? await this.permissionRepo.find({
          where: { userId, resourceType: 'folder' },
        })
      : [];

    const sharedFolders =
      sharedPermissions.length > 0
        ? await this.folderRepo
            .createQueryBuilder('folder')
            .leftJoinAndSelect('folder.owner', 'owner')
            .where('folder.id IN (:...ids)', {
              ids: sharedPermissions.map((p) => p.resourceId),
            })
            .orderBy('folder.position', 'ASC')
            .getMany()
        : [];

    return { folders, files, sharedFolders };
  }

  async getFolderContents(folderId: string, userId: string | null) {
    const folder = await this.folderRepo.findOne({
      where: { id: folderId },
      relations: ['owner'],
    });
    if (!folder) throw new NotFoundException('Folder not found');

    if (!folder.isPublic) {
      if (!userId) throw new ForbiddenException('Access denied');
      await this.checkAccess(folder, userId, 'viewer');
    }

    const isOwner = userId && folder.ownerId === userId;
    const hasPermission = userId ? await this.hasAccess(folder, userId) : false;
    const fullAccess = isOwner || hasPermission;

    const children = fullAccess
      ? await this.folderRepo.find({
          where: { parentId: folderId },
          order: { position: 'ASC' },
          relations: ['owner'],
        })
      : await this.folderRepo.find({
          where: { parentId: folderId, isPublic: true },
          order: { position: 'ASC' },
          relations: ['owner'],
        });

    const files = fullAccess
      ? await this.fileRepo.find({
          where: { folderId },
          order: { position: 'ASC' },
          relations: ['owner'],
        })
      : await this.fileRepo.find({
          where: { folderId, isPublic: true },
          order: { position: 'ASC' },
          relations: ['owner'],
        });

    return { folder, children, files };
  }

  async update(id: string, dto: UpdateFolderDto, userId: string) {
    const folder = await this.folderRepo.findOne({ where: { id } });
    if (!folder) throw new NotFoundException('Folder not found');
    await this.checkAccess(folder, userId, 'editor');

    Object.assign(folder, dto);
    return this.folderRepo.save(folder);
  }

  async remove(id: string, userId: string) {
    const folder = await this.folderRepo.findOne({ where: { id } });
    if (!folder) throw new NotFoundException('Folder not found');
    await this.checkAccess(folder, userId, 'editor');

    await this.folderRepo.remove(folder);
    return { message: 'Folder deleted successfully' };
  }

  async clone(id: string, userId: string) {
    const folder = await this.folderRepo.findOne({ where: { id } });
    if (!folder) throw new NotFoundException('Folder not found');
    await this.checkAccess(folder, userId, 'viewer');

    return this.cloneFolderRecursive(folder, folder.parentId, userId);
  }

  async getBreadcrumbs(folderId: string) {
    const breadcrumbs: { id: string; name: string }[] = [];
    let currentId: string | null = folderId;

    while (currentId) {
      const folder = await this.folderRepo.findOne({
        where: { id: currentId },
      });
      if (!folder) break;
      breadcrumbs.unshift({ id: folder.id, name: folder.name });
      currentId = folder.parentId;
    }

    return breadcrumbs;
  }

  async reorder(
    items: { id: string; position: number }[],
    userId: string,
  ) {
    for (const item of items) {
      await this.folderRepo.update(
        { id: item.id, ownerId: userId },
        { position: item.position },
      );
    }
    return { message: 'Reordered successfully' };
  }

  private async cloneFolderRecursive(
    source: Folder,
    parentId: string | null,
    userId: string,
  ): Promise<Folder> {
    const clone = this.folderRepo.create({
      name: `${source.name} (Copy)`,
      parentId,
      ownerId: userId,
      isPublic: false,
      position: source.position,
    });
    const saved = await this.folderRepo.save(clone);

    const childFolders = await this.folderRepo.find({
      where: { parentId: source.id },
    });
    for (const child of childFolders) {
      await this.cloneFolderRecursive(child, saved.id, userId);
    }

    const files = await this.fileRepo.find({
      where: { folderId: source.id },
    });
    for (const file of files) {
      const fileCopy = this.fileRepo.create({
        name: `${file.name} (Copy)`,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        storagePath: file.storagePath,
        folderId: saved.id,
        ownerId: userId,
        isPublic: false,
        position: file.position,
      });
      await this.fileRepo.save(fileCopy);
    }

    return saved;
  }

  private async hasAccess(folder: Folder, userId: string): Promise<boolean> {
    if (folder.ownerId === userId) return true;
    const permission = await this.permissionRepo.findOne({
      where: { resourceType: 'folder', resourceId: folder.id, userId },
    });
    return !!permission;
  }

  private async checkAccess(
    folder: Folder,
    userId: string,
    requiredLevel: 'viewer' | 'editor',
  ) {
    if (folder.ownerId === userId) return;

    const permission = await this.permissionRepo.findOne({
      where: {
        resourceType: 'folder',
        resourceId: folder.id,
        userId,
      },
    });

    if (!permission) {
      throw new ForbiddenException('You do not have access to this folder');
    }

    if (
      requiredLevel === 'editor' &&
      permission.permission !== 'editor'
    ) {
      throw new ForbiddenException('You need editor access for this action');
    }
  }
}
