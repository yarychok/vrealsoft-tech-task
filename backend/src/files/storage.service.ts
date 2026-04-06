/// <reference types="multer" />
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadsDir =
    process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');

  async onModuleInit() {
    await fs.mkdir(this.uploadsDir, { recursive: true });
    this.logger.log(`Uploads directory: ${this.uploadsDir}`);
  }

  async saveFile(
    file: Express.Multer.File,
    subDir: string = '',
  ): Promise<{ path: string; size: number }> {
    const ext = path.extname(file.originalname);
    const fileName = `${uuidv4()}${ext}`;
    const storagePath = `${subDir}/${fileName}`.replace(/^\//, '');

    const fullDir = path.join(this.uploadsDir, subDir);
    await fs.mkdir(fullDir, { recursive: true });

    const fullPath = path.join(this.uploadsDir, storagePath);
    await fs.writeFile(fullPath, file.buffer);

    return { path: storagePath, size: file.size };
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(this.uploadsDir, filePath);
    try {
      await fs.unlink(fullPath);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        this.logger.warn(`Delete failed: ${(err as Error).message}`);
      }
    }
  }

  getFullPath(filePath: string): string {
    return path.join(this.uploadsDir, filePath);
  }
}
