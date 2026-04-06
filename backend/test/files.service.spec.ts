import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { FilesService } from '../src/files/files.service';
import { FileEntity } from '../src/entities/file.entity';
import { Permission } from '../src/entities/permission.entity';
import { StorageService } from '../src/files/storage.service';

describe('FilesService', () => {
  let service: FilesService;
  let fileRepo: Record<string, jest.Mock>;
  let permissionRepo: Record<string, jest.Mock>;
  let storageService: Record<string, jest.Mock>;

  const userId = 'user-1';

  const mockFile: Partial<FileEntity> = {
    id: 'file-1',
    name: 'test.jpg',
    originalName: 'test.jpg',
    mimeType: 'image/jpeg',
    size: 1024,
    storagePath: 'user-1/abc.jpg',
    folderId: null,
    ownerId: userId,
    isPublic: false,
    position: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    fileRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      update: jest.fn(),
    };

    permissionRepo = {
      findOne: jest.fn(),
    };

    storageService = {
      saveFile: jest.fn().mockResolvedValue({ path: 'user-1/abc.jpg', size: 1024 }),
      deleteFile: jest.fn().mockResolvedValue(undefined),
      getFullPath: jest.fn().mockReturnValue('/app/uploads/user-1/abc.jpg'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        { provide: getRepositoryToken(FileEntity), useValue: fileRepo },
        { provide: getRepositoryToken(Permission), useValue: permissionRepo },
        { provide: StorageService, useValue: storageService },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  describe('upload', () => {
    it('should upload a file and save to repository', async () => {
      fileRepo.create.mockReturnValue(mockFile);
      fileRepo.save.mockResolvedValue(mockFile);

      const multerFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('fake'),
      } as Express.Multer.File;

      const result = await service.upload(multerFile, userId);

      expect(result).toEqual(mockFile);
      expect(storageService.saveFile).toHaveBeenCalled();
    });

    it('should upload non-media files', async () => {
      const textFile: Partial<FileEntity> = {
        ...mockFile,
        mimeType: 'text/plain',
      };
      fileRepo.create.mockReturnValue(textFile);
      fileRepo.save.mockResolvedValue(textFile);

      const multerFile = {
        originalname: 'readme.txt',
        mimetype: 'text/plain',
        size: 100,
        buffer: Buffer.from('hello'),
      } as Express.Multer.File;

      const result = await service.upload(multerFile, userId);

      expect(result).toEqual(textFile);
    });
  });

  describe('findOne', () => {
    it('should return file for owner', async () => {
      fileRepo.findOne.mockResolvedValue(mockFile);

      const result = await service.findOne('file-1', userId);

      expect(result).toEqual(mockFile);
    });

    it('should return public file for anonymous', async () => {
      fileRepo.findOne.mockResolvedValue({ ...mockFile, isPublic: true });

      const result = await service.findOne('file-1', null);

      expect(result.isPublic).toBe(true);
    });

    it('should throw NotFoundException for non-existent file', async () => {
      fileRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent', userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException for private file without access', async () => {
      fileRepo.findOne.mockResolvedValue({
        ...mockFile,
        ownerId: 'other-user',
      });
      permissionRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('file-1', userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('should delete file and storage', async () => {
      fileRepo.findOne.mockResolvedValue(mockFile);
      fileRepo.remove.mockResolvedValue(undefined);

      const result = await service.remove('file-1', userId);

      expect(result.message).toBe('File deleted successfully');
      expect(storageService.deleteFile).toHaveBeenCalledWith(
        mockFile.storagePath,
      );
    });
  });

  describe('clone', () => {
    it('should clone a file', async () => {
      fileRepo.findOne.mockResolvedValue(mockFile);
      const cloned = { ...mockFile, id: 'file-2', name: 'test.jpg (Copy)' };
      fileRepo.create.mockReturnValue(cloned);
      fileRepo.save.mockResolvedValue(cloned);

      const result = await service.clone('file-1', userId);

      expect(result.name).toBe('test.jpg (Copy)');
    });
  });
});
