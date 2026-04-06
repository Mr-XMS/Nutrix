import {
  IsUUID,
  IsDateString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AgreementStatus } from '@prisma/client';
import { AddLineItemDto } from './add-line-item.dto';

export class CreateServiceAgreementDto {
  @ApiProperty()
  @IsUUID()
  participantId: string;

  @ApiProperty()
  @IsUUID()
  ndisPlanId: string;

  @ApiProperty({ example: '2025-07-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-06-30' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ enum: AgreementStatus, default: AgreementStatus.DRAFT })
  @IsOptional()
  @IsEnum(AgreementStatus)
  status?: AgreementStatus;

  @ApiPropertyOptional({ type: [AddLineItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddLineItemDto)
  lineItems?: AddLineItemDto[];
}
