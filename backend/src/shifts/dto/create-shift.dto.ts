import {
  IsUUID,
  IsDateString,
  IsOptional,
  IsEnum,
  IsString,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShiftType } from '@prisma/client';

export class CreateShiftDto {
  @ApiProperty()
  @IsUUID()
  participantId: string;

  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsUUID()
  serviceAgreementItemId: string;

  @ApiProperty({ example: '2026-04-15T09:00:00+10:00' })
  @IsDateString()
  scheduledStart: string;

  @ApiProperty({ example: '2026-04-15T13:00:00+10:00' })
  @IsDateString()
  scheduledEnd: string;

  @ApiPropertyOptional({ enum: ShiftType, default: ShiftType.STANDARD })
  @IsOptional()
  @IsEnum(ShiftType)
  shiftType?: ShiftType;

  @ApiPropertyOptional({ example: 30, description: 'Unpaid break in minutes' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  breakMinutes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
