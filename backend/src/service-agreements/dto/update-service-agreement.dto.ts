import { PartialType, OmitType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsString } from 'class-validator';
import { CreateServiceAgreementDto } from './create-service-agreement.dto';

export class UpdateServiceAgreementDto extends PartialType(
  OmitType(CreateServiceAgreementDto, ['participantId', 'ndisPlanId', 'lineItems'] as const),
) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  signedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  documentUrl?: string;
}
