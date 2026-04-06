import { PartialType, OmitType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { ShiftStatus } from '@prisma/client';
import { CreateShiftDto } from './create-shift.dto';

export class UpdateShiftDto extends PartialType(
  OmitType(CreateShiftDto, ['participantId', 'userId', 'serviceAgreementItemId'] as const),
) {
  @ApiPropertyOptional({ enum: ShiftStatus })
  @IsOptional()
  @IsEnum(ShiftStatus)
  status?: ShiftStatus;
}
