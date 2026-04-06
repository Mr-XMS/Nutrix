import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class IncidentsService {
  constructor(private prisma: PrismaService) {}
}
