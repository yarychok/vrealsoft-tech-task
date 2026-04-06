import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsUUID,
  IsArray,
  ValidateNested,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';

class PermissionEntry {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: ['editor', 'viewer'] })
  @IsEnum(['editor', 'viewer'])
  permission: 'editor' | 'viewer';
}

export class GrantPermissionDto {
  @ApiProperty({ enum: ['file', 'folder'] })
  @IsEnum(['file', 'folder'])
  resourceType: 'file' | 'folder';

  @ApiProperty()
  @IsUUID()
  resourceId: string;

  @ApiProperty({ type: [PermissionEntry] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionEntry)
  entries: PermissionEntry[];
}
