import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { PlanStatus } from '@prisma/client';
import { CreateNdisPlanDto } from './create-ndis-plan.dto';

export class UpdateNdisPlanDto extends PartialType(CreateNdisPlanDto) {
  @ApiPropertyOptional({ enum: PlanStatus })
  @IsOptional()
  @IsEnum(PlanStatus)
  status?: PlanStatus;
}
