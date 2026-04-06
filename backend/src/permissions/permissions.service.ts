import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { User } from '../entities/user.entity';
import { Folder } from '../entities/folder.entity';
import { FileEntity } from '../entities/file.entity';
import { GrantPermissionDto } from './dto/grant-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Folder)
    private readonly folderRepo: Repository<Folder>,
    @InjectRepository(FileEntity)
    private readonly fileRepo: Repository<FileEntity>,
  ) {}

  async getForResource(
    resourceType: 'file' | 'folder',
    resourceId: string,
    userId: string,
  ) {
    await this.checkOwnership(resourceType, resourceId, userId);

    return this.permissionRepo.find({
      where: { resourceType, resourceId },
      relations: ['user', 'grantedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async grant(dto: GrantPermissionDto, grantedById: string) {
    await this.checkOwnership(dto.resourceType, dto.resourceId, grantedById);

    const results: Permission[] = [];

    for (const entry of dto.entries) {
      const user = await this.userRepo.findOne({
        where: { email: entry.email },
      });
      if (!user) {
        throw new BadRequestException(
          `User with email ${entry.email} not found`,
        );
      }
      if (user.id === grantedById) {
        throw new BadRequestException('Cannot grant permission to yourself');
      }

      const existing = await this.permissionRepo.findOne({
        where: {
          resourceType: dto.resourceType,
          resourceId: dto.resourceId,
          userId: user.id,
        },
      });

      if (existing) {
        existing.permission = entry.permission;
        results.push(await this.permissionRepo.save(existing));
      } else {
        const permission = this.permissionRepo.create({
          resourceType: dto.resourceType,
          resourceId: dto.resourceId,
          userId: user.id,
          grantedById,
          permission: entry.permission,
        });
        results.push(await this.permissionRepo.save(permission));
      }
    }

    return results;
  }

  async revoke(permissionId: string, userId: string) {
    const permission = await this.permissionRepo.findOne({
      where: { id: permissionId },
    });
    if (!permission) throw new NotFoundException('Permission not found');

    await this.checkOwnership(
      permission.resourceType,
      permission.resourceId,
      userId,
    );

    await this.permissionRepo.remove(permission);
    return { message: 'Permission revoked successfully' };
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
      if (folder.ownerId !== userId)
        throw new ForbiddenException('Only the owner can manage permissions');
    } else {
      const file = await this.fileRepo.findOne({
        where: { id: resourceId },
      });
      if (!file) throw new NotFoundException('File not found');
      if (file.ownerId !== userId)
        throw new ForbiddenException('Only the owner can manage permissions');
    }
  }
}
