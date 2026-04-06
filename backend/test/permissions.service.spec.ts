import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PermissionsService } from '../src/permissions/permissions.service';
import { Permission } from '../src/entities/permission.entity';
import { User } from '../src/entities/user.entity';
import { Folder } from '../src/entities/folder.entity';
import { FileEntity } from '../src/entities/file.entity';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let permissionRepo: Record<string, jest.Mock>;
  let userRepo: Record<string, jest.Mock>;
  let folderRepo: Record<string, jest.Mock>;
  let fileRepo: Record<string, jest.Mock>;

  const ownerId = 'owner-1';
  const granteeId = 'grantee-1';

  const mockFolder: Partial<Folder> = {
    id: 'folder-1',
    name: 'Test',
    ownerId,
  };

  const mockUser: Partial<User> = {
    id: granteeId,
    email: 'grantee@example.com',
    name: 'Grantee',
  };

  const mockPermission: Partial<Permission> = {
    id: 'perm-1',
    resourceType: 'folder',
    resourceId: 'folder-1',
    userId: granteeId,
    grantedById: ownerId,
    permission: 'viewer',
  };

  beforeEach(async () => {
    permissionRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    userRepo = {
      findOne: jest.fn(),
    };

    folderRepo = {
      findOne: jest.fn(),
    };

    fileRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        { provide: getRepositoryToken(Permission), useValue: permissionRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Folder), useValue: folderRepo },
        { provide: getRepositoryToken(FileEntity), useValue: fileRepo },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
  });

  describe('grant', () => {
    it('should grant permission to a user', async () => {
      folderRepo.findOne.mockResolvedValue(mockFolder);
      userRepo.findOne.mockResolvedValue(mockUser);
      permissionRepo.findOne.mockResolvedValue(null);
      permissionRepo.create.mockReturnValue(mockPermission);
      permissionRepo.save.mockResolvedValue(mockPermission);

      const result = await service.grant(
        {
          resourceType: 'folder',
          resourceId: 'folder-1',
          entries: [
            { email: 'grantee@example.com', permission: 'viewer' },
          ],
        },
        ownerId,
      );

      expect(result).toHaveLength(1);
      expect(permissionRepo.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException for non-existent user', async () => {
      folderRepo.findOne.mockResolvedValue(mockFolder);
      userRepo.findOne.mockResolvedValue(null);

      await expect(
        service.grant(
          {
            resourceType: 'folder',
            resourceId: 'folder-1',
            entries: [
              { email: 'nobody@example.com', permission: 'viewer' },
            ],
          },
          ownerId,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException for non-owner', async () => {
      folderRepo.findOne.mockResolvedValue({
        ...mockFolder,
        ownerId: 'someone-else',
      });

      await expect(
        service.grant(
          {
            resourceType: 'folder',
            resourceId: 'folder-1',
            entries: [
              { email: 'grantee@example.com', permission: 'viewer' },
            ],
          },
          ownerId,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should update existing permission', async () => {
      folderRepo.findOne.mockResolvedValue(mockFolder);
      userRepo.findOne.mockResolvedValue(mockUser);
      permissionRepo.findOne.mockResolvedValue({ ...mockPermission });
      permissionRepo.save.mockResolvedValue({
        ...mockPermission,
        permission: 'editor',
      });

      const result = await service.grant(
        {
          resourceType: 'folder',
          resourceId: 'folder-1',
          entries: [
            { email: 'grantee@example.com', permission: 'editor' },
          ],
        },
        ownerId,
      );

      expect(result[0].permission).toBe('editor');
    });
  });

  describe('revoke', () => {
    it('should revoke a permission', async () => {
      permissionRepo.findOne.mockResolvedValue(mockPermission);
      folderRepo.findOne.mockResolvedValue(mockFolder);
      permissionRepo.remove.mockResolvedValue(undefined);

      const result = await service.revoke('perm-1', ownerId);

      expect(result.message).toBe('Permission revoked successfully');
    });

    it('should throw NotFoundException for non-existent permission', async () => {
      permissionRepo.findOne.mockResolvedValue(null);

      await expect(
        service.revoke('non-existent', ownerId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
