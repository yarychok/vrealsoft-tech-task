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
import { PermissionsService } from './permissions.service';
import { GrantPermissionDto } from './dto/grant-permission.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Permissions')
@Controller('permissions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get(':resourceType/:resourceId')
  getForResource(
    @Param('resourceType') resourceType: 'file' | 'folder',
    @Param('resourceId', ParseUUIDPipe) resourceId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.permissionsService.getForResource(
      resourceType,
      resourceId,
      userId,
    );
  }

  @Post()
  grant(
    @Body() dto: GrantPermissionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.permissionsService.grant(dto, userId);
  }

  @Delete(':id')
  revoke(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.permissionsService.revoke(id, userId);
  }
}
