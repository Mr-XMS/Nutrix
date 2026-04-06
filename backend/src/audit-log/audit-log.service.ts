import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}
}
