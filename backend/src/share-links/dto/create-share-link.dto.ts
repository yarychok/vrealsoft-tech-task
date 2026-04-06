import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsUUID, IsOptional, IsDateString } from 'class-validator';

export class CreateShareLinkDto {
  @ApiProperty({ enum: ['file', 'folder'] })
  @IsEnum(['file', 'folder'])
  resourceType: 'file' | 'folder';

  @ApiProperty()
  @IsUUID()
  resourceId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
