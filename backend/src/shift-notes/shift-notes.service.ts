import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ShiftNotesService {
  constructor(private prisma: PrismaService) {}
}
