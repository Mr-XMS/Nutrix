import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OrganisationsService } from './organisations.service';

@ApiTags('Organisations')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('organisations')
export class OrganisationsController {
  constructor(private service: OrganisationsService) {}
}
