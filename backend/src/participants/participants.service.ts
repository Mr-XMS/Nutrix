import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { QueryParticipantsDto } from './dto/query-participants.dto';

@Injectable()
export class ParticipantsService {
  constructor(private prisma: PrismaService) {}

  async create(organisationId: string, dto: CreateParticipantDto) {
    const existing = await this.prisma.participant.findUnique({
      where: {
        organisationId_ndisNumber: {
          organisationId,
          ndisNumber: dto.ndisNumber,
        },
      },
    });

    if (existing) {
      throw new ConflictException(`Participant with NDIS number ${dto.ndisNumber} already exists`);
    }

    return this.prisma.participant.create({
      data: {
        organisationId,
        ...dto,
        dateOfBirth: new Date(dto.dateOfBirth),
        address: dto.address ? (dto.address as Prisma.InputJsonValue) : undefined,
        emergencyContact: dto.emergencyContact
          ? (dto.emergencyContact as Prisma.InputJsonValue)
          : undefined,
      },
      include: {
        ndisPlans: {
          where: { status: 'ACTIVE' },
          orderBy: { planStartDate: 'desc' },
          take: 1,
        },
      },
    });
  }

  async findAll(organisationId: string, query: QueryParticipantsDto) {
    const { search, status, managementType, page = 1, limit = 20, sortBy = 'lastName', sortOrder = 'asc' } = query;

    const where: Prisma.ParticipantWhereInput = {
      organisationId,
      deletedAt: null,
      ...(status && { status }),
      ...(managementType && { managementType }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { ndisNumber: { contains: search } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [participants, total] = await Promise.all([
      this.prisma.participant.findMany({
        where,
        include: {
          ndisPlans: {
            where: { status: 'ACTIVE' },
            orderBy: { planStartDate: 'desc' },
            take: 1,
          },
          _count: { select: { shifts: true, invoices: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.participant.count({ where }),
    ]);

    return {
      data: participants,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(organisationId: string, id: string) {
    const participant = await this.prisma.participant.findFirst({
      where: { id, organisationId, deletedAt: null },
      include: {
        ndisPlans: {
          orderBy: { planStartDate: 'desc' },
          include: {
            fundingPeriods: true,
            serviceAgreements: {
              include: { lineItems: true },
              orderBy: { startDate: 'desc' },
            },
          },
        },
        _count: { select: { shifts: true, invoices: true, incidents: true } },
      },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    return participant;
  }

  async update(organisationId: string, id: string, dto: UpdateParticipantDto) {
    await this.findOne(organisationId, id);

    if (dto.ndisNumber) {
      const existing = await this.prisma.participant.findFirst({
        where: {
          organisationId,
          ndisNumber: dto.ndisNumber,
          id: { not: id },
          deletedAt: null,
        },
      });
      if (existing) {
        throw new ConflictException(`NDIS number ${dto.ndisNumber} is already in use`);
      }
    }

    return this.prisma.participant.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.dateOfBirth && { dateOfBirth: new Date(dto.dateOfBirth) }),
        ...(dto.address && { address: dto.address as Prisma.InputJsonValue }),
        ...(dto.emergencyContact && {
          emergencyContact: dto.emergencyContact as Prisma.InputJsonValue,
        }),
      },
    });
  }

  async softDelete(organisationId: string, id: string) {
    await this.findOne(organisationId, id);

    return this.prisma.participant.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'EXITED' },
    });
  }

  async importCsv(organisationId: string, rows: CreateParticipantDto[]) {
    const results = { created: 0, skipped: 0, errors: [] as string[] };

    for (const row of rows) {
      try {
        await this.create(organisationId, row);
        results.created++;
      } catch (error) {
        if (error instanceof ConflictException) {
          results.skipped++;
          results.errors.push(`NDIS ${row.ndisNumber}: already exists`);
        } else {
          results.errors.push(`NDIS ${row.ndisNumber}: ${error.message}`);
        }
      }
    }

    return results;
  }

  async getExpiringPlans(organisationId: string, daysAhead: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + daysAhead);

    return this.prisma.participant.findMany({
      where: {
        organisationId,
        deletedAt: null,
        status: 'ACTIVE',
        ndisPlans: {
          some: {
            status: 'ACTIVE',
            planEndDate: { lte: cutoffDate },
          },
        },
      },
      include: {
        ndisPlans: {
          where: {
            status: 'ACTIVE',
            planEndDate: { lte: cutoffDate },
          },
        },
      },
      orderBy: {
        ndisPlans: { _count: 'desc' },
      },
    });
  }
}
