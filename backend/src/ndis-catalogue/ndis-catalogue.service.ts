import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, FundingCategory } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class NdisCatalogueService {
  constructor(private prisma: PrismaService) {}

  async search(query: {
    search?: string;
    category?: FundingCategory;
    registrationGroup?: string;
    limit?: number;
  }) {
    const { search, category, registrationGroup, limit = 50 } = query;

    const where: Prisma.NdisSupportCatalogueWhereInput = {
      effectiveTo: null,
      ...(category && { supportCategory: category }),
      ...(registrationGroup && { registrationGroup }),
      ...(search && {
        OR: [
          { supportItemName: { contains: search, mode: 'insensitive' } },
          { supportItemNumber: { contains: search } },
          { registrationGroup: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    return this.prisma.ndisSupportCatalogue.findMany({
      where,
      orderBy: [{ supportCategory: 'asc' }, { supportItemNumber: 'asc' }],
      take: limit,
    });
  }

  async findByItemNumber(supportItemNumber: string) {
    const item = await this.prisma.ndisSupportCatalogue.findUnique({
      where: { supportItemNumber },
    });

    if (!item) {
      throw new NotFoundException(`Support item ${supportItemNumber} not found`);
    }

    return item;
  }

  async getRegistrationGroups() {
    const groups = await this.prisma.ndisSupportCatalogue.findMany({
      where: { effectiveTo: null },
      select: { registrationGroup: true },
      distinct: ['registrationGroup'],
      orderBy: { registrationGroup: 'asc' },
    });

    return groups.map((g) => g.registrationGroup);
  }
}
