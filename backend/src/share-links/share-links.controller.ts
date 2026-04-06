import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ShareLinksService } from './share-links.service';
import { CreateShareLinkDto } from './dto/create-share-link.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Share Links')
@Controller('share-links')
export class ShareLinksController {
  constructor(private readonly shareLinksService: ShareLinksService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(
    @Body() dto: CreateShareLinkDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.shareLinksService.create(dto, userId);
  }

  @Get('token/:token')
  getByToken(@Param('token') token: string) {
    return this.shareLinksService.getByToken(token);
  }

  @Get(':resourceType/:resourceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getForResource(
    @Param('resourceType') resourceType: 'file' | 'folder',
    @Param('resourceId', ParseUUIDPipe) resourceId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.shareLinksService.getForResource(
      resourceType,
      resourceId,
      userId,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.shareLinksService.remove(id, userId);
  }
}
