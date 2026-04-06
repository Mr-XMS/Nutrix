import { IsNumber, Min, IsOptional, IsDateString, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecordPaymentDto {
  @ApiProperty({ example: 270.24 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ example: '2026-05-10' })
  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @ApiPropertyOptional({ example: 'EFT — Plan Partners Pty Ltd' })
  @IsOptional()
  @IsString()
  reference?: string;
}
