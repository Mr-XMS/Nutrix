import {
  IsUUID,
  IsDateString,
  IsString,
  Matches,
  IsArray,
  ArrayMinSize,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShiftType } from '@prisma/client';

export class CreateRecurringShiftDto {
  @ApiProperty()
  @IsUUID()
  participantId: string;

  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsUUID()
  serviceAgreementItemId: string;

  @ApiProperty({ example: '2026-04-15', description: 'Series start date (inclusive)' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-07-15', description: 'Series end date (inclusive)' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: '09:00', description: 'HH:mm format' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'startTime must be HH:mm format' })
  startTime: string;

  @ApiProperty({ example: '13:00', description: 'HH:mm format' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'endTime must be HH:mm format' })
  endTime: string;

  @ApiProperty({
    example: [1, 3, 5],
    description: '0=Sunday, 1=Monday, ..., 6=Saturday',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  @Type(() => Number)
  daysOfWeek: number[];

  @ApiPropertyOptional({ enum: ShiftType })
  @IsOptional()
  @IsEnum(ShiftType)
  shiftType?: ShiftType;

  @ApiPropertyOptional({ example: 30 })
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
