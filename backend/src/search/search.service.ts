import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Folder } from '../entities/folder.entity';
import { FileEntity } from '../entities/file.entity';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Folder)
    private readonly folderRepo: Repository<Folder>,
    @InjectRepository(FileEntity)
    private readonly fileRepo: Repository<FileEntity>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  async search(query: string, userId: string) {
    const folders = await this.folderRepo.find({
      where: [
        { name: ILike(`%${query}%`), ownerId: userId },
        { name: ILike(`%${query}%`), isPublic: true },
      ],
      relations: ['owner'],
      take: 50,
      order: { name: 'ASC' },
    });

    const files = await this.fileRepo.find({
      where: [
        { name: ILike(`%${query}%`), ownerId: userId },
        { name: ILike(`%${query}%`), isPublic: true },
      ],
      relations: ['owner'],
      take: 50,
      order: { name: 'ASC' },
    });

    const folderPermissions = await this.permissionRepo.find({
      where: { userId, resourceType: 'folder' },
    });
    const filePermissions = await this.permissionRepo.find({
      where: { userId, resourceType: 'file' },
    });

    let sharedFolders: Folder[] = [];
    if (folderPermissions.length > 0) {
      sharedFolders = await this.folderRepo
        .createQueryBuilder('folder')
        .leftJoinAndSelect('folder.owner', 'owner')
        .where('folder.id IN (:...ids)', {
          ids: folderPermissions.map((p) => p.resourceId),
        })
        .andWhere('folder.name ILIKE :query', { query: `%${query}%` })
        .getMany();
    }

    let sharedFiles: FileEntity[] = [];
    if (filePermissions.length > 0) {
      sharedFiles = await this.fileRepo
        .createQueryBuilder('file')
        .leftJoinAndSelect('file.owner', 'owner')
        .where('file.id IN (:...ids)', {
          ids: filePermissions.map((p) => p.resourceId),
        })
        .andWhere('file.name ILIKE :query', { query: `%${query}%` })
        .getMany();
    }

    if (folderPermissions.length > 0) {
      const sharedFolderIds = folderPermissions.map((p) => p.resourceId);

      const filesInSharedFolders = await this.fileRepo
        .createQueryBuilder('file')
        .leftJoinAndSelect('file.owner', 'owner')
        .where('file.folder_id IN (:...folderIds)', { folderIds: sharedFolderIds })
        .andWhere('file.name ILIKE :query', { query: `%${query}%` })
        .getMany();

      for (const f of filesInSharedFolders) {
        if (!sharedFiles.find((sf) => sf.id === f.id) && !files.find((ef) => ef.id === f.id)) {
          sharedFiles.push(f);
        }
      }

      const subfoldersInShared = await this.folderRepo
        .createQueryBuilder('folder')
        .leftJoinAndSelect('folder.owner', 'owner')
        .where('folder.parent_id IN (:...parentIds)', { parentIds: sharedFolderIds })
        .andWhere('folder.name ILIKE :query', { query: `%${query}%` })
        .getMany();

      for (const f of subfoldersInShared) {
        if (!sharedFolders.find((sf) => sf.id === f.id) && !folders.find((ef) => ef.id === f.id)) {
          sharedFolders.push(f);
        }
      }
    }

    const allFolders = [
      ...folders,
      ...sharedFolders.filter((sf) => !folders.find((f) => f.id === sf.id)),
    ];
    const allFiles = [
      ...files,
      ...sharedFiles.filter((sf) => !files.find((f) => f.id === sf.id)),
    ];

    const permissionMap: Record<string, 'editor' | 'viewer'> = {};
    for (const p of folderPermissions) {
      permissionMap[p.resourceId] = p.permission;
    }
    for (const p of filePermissions) {
      permissionMap[p.resourceId] = p.permission;
    }
    for (const f of allFiles) {
      if (!permissionMap[f.id] && f.folderId && permissionMap[f.folderId]) {
        permissionMap[f.id] = permissionMap[f.folderId];
      }
    }
    for (const f of allFolders) {
      if (!permissionMap[f.id] && f.parentId && permissionMap[f.parentId]) {
        permissionMap[f.id] = permissionMap[f.parentId];
      }
    }

    return { folders: allFolders, files: allFiles, permissionMap };
  }
}
