import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogService } from './audit-log.service';

@ApiTags('AuditLog')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('audit-log')
export class AuditLogController {
  constructor(private service: AuditLogService) {}
}
