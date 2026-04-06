import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NdisPlansService } from './ndis-plans.service';

@ApiTags('NdisPlans')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('ndis-plans')
export class NdisPlansController {
  constructor(private service: NdisPlansService) {}
}
