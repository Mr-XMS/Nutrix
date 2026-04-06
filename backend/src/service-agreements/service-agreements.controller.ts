import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ServiceAgreementsService } from './service-agreements.service';

@ApiTags('ServiceAgreements')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('service-agreements')
export class ServiceAgreementsController {
  constructor(private service: ServiceAgreementsService) {}
}
