import { IsDateString, IsOptional, IsArray, IsUUID, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateInvoicesDto {
  @ApiProperty({ example: '2026-04-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-04-30' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({
    description: 'Optionally restrict to specific participants. Otherwise all eligible.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  participantIds?: string[];

  @ApiPropertyOptional({ default: 14, example: 14 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(120)
  paymentTermsDays?: number;
}
