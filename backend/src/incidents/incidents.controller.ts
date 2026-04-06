import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IncidentsService } from './incidents.service';

@ApiTags('Incidents')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('incidents')
export class IncidentsController {
  constructor(private service: IncidentsService) {}
}
