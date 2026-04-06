import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalAuthGuard } from '../common/guards/optional-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ReorderDto } from '../common/dto/reorder.dto';

@ApiTags('Folders')
@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(
    @Body() dto: CreateFolderDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.foldersService.create(dto, userId);
  }

  @Get()
  @UseGuards(OptionalAuthGuard)
  getRootContents(@CurrentUser('id') userId: string | null) {
    return this.foldersService.getRootContents(userId);
  }

  @Patch('reorder/batch')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  reorder(
    @Body() dto: ReorderDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.foldersService.reorder(dto.items, userId);
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  getFolderContents(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string | null,
  ) {
    return this.foldersService.getFolderContents(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFolderDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.foldersService.update(id, dto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.foldersService.remove(id, userId);
  }

  @Post(':id/clone')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  clone(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.foldersService.clone(id, userId);
  }

  @Get(':id/breadcrumbs')
  getBreadcrumbs(@Param('id', ParseUUIDPipe) id: string) {
    return this.foldersService.getBreadcrumbs(id);
  }
}
