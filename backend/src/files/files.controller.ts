import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  ParseUUIDPipe,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FilesService } from './files.service';
import { UpdateFileDto } from './dto/update-file.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalAuthGuard } from '../common/guards/optional-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ReorderDto } from '../common/dto/reorder.dto';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 100 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folderId: { type: 'string', nullable: true },
        isPublic: { type: 'boolean' },
      },
    },
  })
  upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: string,
    @Body('folderId') folderId?: string,
    @Body('isPublic') isPublic?: string,
  ) {
    return this.filesService.upload(
      file,
      userId,
      folderId,
      isPublic === 'true',
    );
  }

  @Patch('reorder/batch')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  reorder(
    @Body() dto: ReorderDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.filesService.reorder(dto.items, userId);
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string | null,
  ) {
    return this.filesService.findOne(id, userId);
  }

  @Get(':id/download')
  @UseGuards(OptionalAuthGuard)
  async download(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string | null,
    @Res() res: Response,
  ) {
    const { file, fullPath } = await this.filesService.download(id, userId);
    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(file.originalName)}"`,
    });
    const { createReadStream } = await import('fs');
    createReadStream(fullPath).pipe(res);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFileDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.filesService.update(id, dto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.filesService.remove(id, userId);
  }

  @Post(':id/clone')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  clone(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.filesService.clone(id, userId);
  }
}
