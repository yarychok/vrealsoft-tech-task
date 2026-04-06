import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { FoldersService } from '../src/folders/folders.service';
import { Folder } from '../src/entities/folder.entity';
import { FileEntity } from '../src/entities/file.entity';
import { Permission } from '../src/entities/permission.entity';

describe('FoldersService', () => {
  let service: FoldersService;
  let folderRepo: Record<string, jest.Mock>;
  let fileRepo: Record<string, jest.Mock>;
  let permissionRepo: Record<string, jest.Mock>;

  const userId = 'user-1';

  const mockFolder: Partial<Folder> = {
    id: 'folder-1',
    name: 'Test Folder',
    parentId: null,
    ownerId: userId,
    isPublic: false,
    position: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ max: 0 }),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };

    folderRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    fileRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    permissionRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoldersService,
        { provide: getRepositoryToken(Folder), useValue: folderRepo },
        { provide: getRepositoryToken(FileEntity), useValue: fileRepo },
        { provide: getRepositoryToken(Permission), useValue: permissionRepo },
      ],
    }).compile();

    service = module.get<FoldersService>(FoldersService);
  });

  describe('create', () => {
    it('should create a root folder', async () => {
      folderRepo.create.mockReturnValue(mockFolder);
      folderRepo.save.mockResolvedValue(mockFolder);

      const result = await service.create(
        { name: 'Test Folder' },
        userId,
      );

      expect(result).toEqual(mockFolder);
      expect(folderRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Test Folder', ownerId: userId }),
      );
    });

    it('should throw NotFoundException for invalid parent', async () => {
      folderRepo.findOne.mockResolvedValue(null);

      await expect(
        service.create(
          { name: 'Child', parentId: 'non-existent' },
          userId,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update folder name', async () => {
      folderRepo.findOne.mockResolvedValue(mockFolder);
      folderRepo.save.mockResolvedValue({ ...mockFolder, name: 'Updated' });

      const result = await service.update(
        'folder-1',
        { name: 'Updated' },
        userId,
      );

      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException for non-existent folder', async () => {
      folderRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { name: 'Updated' }, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for non-owner', async () => {
      folderRepo.findOne.mockResolvedValue({
        ...mockFolder,
        ownerId: 'other-user',
      });
      permissionRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update('folder-1', { name: 'Updated' }, userId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete a folder', async () => {
      folderRepo.findOne.mockResolvedValue(mockFolder);
      folderRepo.remove.mockResolvedValue(undefined);

      const result = await service.remove('folder-1', userId);

      expect(result.message).toBe('Folder deleted successfully');
    });
  });

  describe('getBreadcrumbs', () => {
    it('should return breadcrumb trail', async () => {
      const parent = { id: 'parent-1', name: 'Parent', parentId: null };
      const child = { id: 'child-1', name: 'Child', parentId: 'parent-1' };

      folderRepo.findOne
        .mockResolvedValueOnce(child)
        .mockResolvedValueOnce(parent);

      const result = await service.getBreadcrumbs('child-1');

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Parent');
      expect(result[1].name).toBe('Child');
    });
  });
});
