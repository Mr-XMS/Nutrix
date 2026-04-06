import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ShiftsService } from './shifts.service';

@ApiTags('Shifts')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('shifts')
export class ShiftsController {
  constructor(private service: ShiftsService) {}
}
