import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ParticipantStatus, ManagementType } from '@prisma/client';

export class QueryParticipantsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ParticipantStatus })
  @IsOptional()
  @IsEnum(ParticipantStatus)
  status?: ParticipantStatus;

  @ApiPropertyOptional({ enum: ManagementType })
  @IsOptional()
  @IsEnum(ManagementType)
  managementType?: ManagementType;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ default: 'lastName' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'lastName';

  @ApiPropertyOptional({ default: 'asc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}
