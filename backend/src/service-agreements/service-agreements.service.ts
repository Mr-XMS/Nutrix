import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Prisma, AgreementStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { CreateServiceAgreementDto } from './dto/create-service-agreement.dto';
import { UpdateServiceAgreementDto } from './dto/update-service-agreement.dto';
import { AddLineItemDto } from './dto/add-line-item.dto';

@Injectable()
export class ServiceAgreementsService {
  constructor(private prisma: PrismaService) {}

  async create(organisationId: string, dto: CreateServiceAgreementDto) {
    const participant = await this.prisma.participant.findFirst({
      where: { id: dto.participantId, organisationId, deletedAt: null },
    });
    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    const plan = await this.prisma.ndisPlan.findFirst({
      where: { id: dto.ndisPlanId, participantId: dto.participantId },
    });
    if (!plan) {
      throw new NotFoundException('NDIS plan not found for this participant');
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    if (startDate < plan.planStartDate || endDate > plan.planEndDate) {
      throw new BadRequestException(
        'Service agreement dates must fall within the NDIS plan period',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const agreement = await tx.serviceAgreement.create({
        data: {
          organisationId,
          participantId: dto.participantId,
          ndisPlanId: dto.ndisPlanId,
          startDate,
          endDate,
          status: dto.status || AgreementStatus.DRAFT,
        },
      });

      if (dto.lineItems && dto.lineItems.length > 0) {
        await this.validateAndCreateLineItems(tx, agreement.id, dto.lineItems, plan);
      }

      return tx.serviceAgreement.findUnique({
        where: { id: agreement.id },
        include: {
          lineItems: true,
          participant: { select: { firstName: true, lastName: true, ndisNumber: true } },
        },
      });
    });
  }

  async findAll(organisationId: string, participantId?: string, status?: AgreementStatus) {
    return this.prisma.serviceAgreement.findMany({
      where: {
        organisationId,
        ...(participantId && { participantId }),
        ...(status && { status }),
      },
      include: {
        participant: {
          select: { id: true, firstName: true, lastName: true, ndisNumber: true },
        },
        lineItems: true,
        _count: { select: { lineItems: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(organisationId: string, id: string) {
    const agreement = await this.prisma.serviceAgreement.findFirst({
      where: { id, organisationId },
      include: {
        participant: true,
        ndisPlan: true,
        lineItems: { orderBy: { supportItemNumber: 'asc' } },
      },
    });

    if (!agreement) {
      throw new NotFoundException('Service agreement not found');
    }

    return agreement;
  }

  async update(organisationId: string, id: string, dto: UpdateServiceAgreementDto) {
    const existing = await this.findOne(organisationId, id);

    if (existing.status === AgreementStatus.EXPIRED || existing.status === AgreementStatus.CANCELLED) {
      throw new BadRequestException(
        `Cannot modify a ${existing.status.toLowerCase()} service agreement`,
      );
    }

    const updateData: Prisma.ServiceAgreementUpdateInput = {};

    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate) updateData.endDate = new Date(dto.endDate);
    if (dto.status) updateData.status = dto.status;
    if (dto.signedAt) updateData.signedAt = new Date(dto.signedAt);
    if (dto.documentUrl !== undefined) updateData.documentUrl = dto.documentUrl;

    return this.prisma.serviceAgreement.update({
      where: { id },
      data: updateData,
      include: { lineItems: true },
    });
  }

  async activate(organisationId: string, id: string) {
    const agreement = await this.findOne(organisationId, id);

    if (agreement.status !== AgreementStatus.DRAFT) {
      throw new BadRequestException('Only draft agreements can be activated');
    }

    if (agreement.lineItems.length === 0) {
      throw new BadRequestException('Cannot activate an agreement with no line items');
    }

    return this.prisma.serviceAgreement.update({
      where: { id },
      data: {
        status: AgreementStatus.ACTIVE,
        signedAt: new Date(),
      },
      include: { lineItems: true },
    });
  }

  async cancel(organisationId: string, id: string) {
    await this.findOne(organisationId, id);

    return this.prisma.serviceAgreement.update({
      where: { id },
      data: { status: AgreementStatus.CANCELLED },
    });
  }

  async addLineItem(organisationId: string, agreementId: string, dto: AddLineItemDto) {
    const agreement = await this.findOne(organisationId, agreementId);

    if (agreement.status === AgreementStatus.EXPIRED || agreement.status === AgreementStatus.CANCELLED) {
      throw new BadRequestException(
        `Cannot add items to a ${agreement.status.toLowerCase()} agreement`,
      );
    }

    const catalogueItem = await this.prisma.ndisSupportCatalogue.findUnique({
      where: { supportItemNumber: dto.supportItemNumber },
    });

    if (!catalogueItem) {
      throw new NotFoundException(
        `NDIS support item ${dto.supportItemNumber} not found in catalogue`,
      );
    }

    if (Number(dto.unitPrice) > Number(catalogueItem.priceLimit)) {
      throw new BadRequestException(
        `Unit price $${dto.unitPrice} exceeds NDIS price limit $${catalogueItem.priceLimit} for this support item`,
      );
    }

    const existingItem = await this.prisma.serviceAgreementItem.findFirst({
      where: { serviceAgreementId: agreementId, supportItemNumber: dto.supportItemNumber },
    });

    if (existingItem) {
      throw new ConflictException(
        `Support item ${dto.supportItemNumber} is already on this agreement`,
      );
    }

    const allocatedBudget = Number(dto.unitPrice) * Number(dto.allocatedQty);

    return this.prisma.serviceAgreementItem.create({
      data: {
        serviceAgreementId: agreementId,
        supportItemNumber: dto.supportItemNumber,
        supportItemName: catalogueItem.supportItemName,
        category: catalogueItem.supportCategory,
        unitPrice: dto.unitPrice,
        allocatedQty: dto.allocatedQty,
        allocatedBudget,
      },
    });
  }

  async removeLineItem(organisationId: string, agreementId: string, itemId: string) {
    const agreement = await this.findOne(organisationId, agreementId);

    const item = agreement.lineItems.find((li) => li.id === itemId);
    if (!item) {
      throw new NotFoundException('Line item not found');
    }

    if (Number(item.deliveredQty) > 0) {
      throw new BadRequestException(
        'Cannot remove a line item with delivered services. Mark as zero allocation instead.',
      );
    }

    return this.prisma.serviceAgreementItem.delete({ where: { id: itemId } });
  }

  private async validateAndCreateLineItems(
    tx: Prisma.TransactionClient,
    agreementId: string,
    items: AddLineItemDto[],
    plan: { coreBudget: any; capacityBuildingBudget: any; capitalBudget: any },
  ) {
    const itemNumbers = items.map((i) => i.supportItemNumber);
    const catalogueItems = await tx.ndisSupportCatalogue.findMany({
      where: { supportItemNumber: { in: itemNumbers } },
    });

    const catalogueMap = new Map(catalogueItems.map((c) => [c.supportItemNumber, c]));

    const totals = { CORE: 0, CAPACITY_BUILDING: 0, CAPITAL: 0 };

    for (const item of items) {
      const cat = catalogueMap.get(item.supportItemNumber);
      if (!cat) {
        throw new NotFoundException(`Support item ${item.supportItemNumber} not in catalogue`);
      }
      if (Number(item.unitPrice) > Number(cat.priceLimit)) {
        throw new BadRequestException(
          `${item.supportItemNumber}: price $${item.unitPrice} exceeds limit $${cat.priceLimit}`,
        );
      }
      totals[cat.supportCategory] += Number(item.unitPrice) * Number(item.allocatedQty);
    }

    if (totals.CORE > Number(plan.coreBudget)) {
      throw new BadRequestException(
        `Core supports total ($${totals.CORE.toFixed(2)}) exceeds plan budget ($${Number(plan.coreBudget).toFixed(2)})`,
      );
    }
    if (totals.CAPACITY_BUILDING > Number(plan.capacityBuildingBudget)) {
      throw new BadRequestException(
        `Capacity Building total ($${totals.CAPACITY_BUILDING.toFixed(2)}) exceeds plan budget ($${Number(plan.capacityBuildingBudget).toFixed(2)})`,
      );
    }
    if (totals.CAPITAL > Number(plan.capitalBudget)) {
      throw new BadRequestException(
        `Capital total ($${totals.CAPITAL.toFixed(2)}) exceeds plan budget ($${Number(plan.capitalBudget).toFixed(2)})`,
      );
    }

    await tx.serviceAgreementItem.createMany({
      data: items.map((item) => {
        const cat = catalogueMap.get(item.supportItemNumber)!;
        return {
          serviceAgreementId: agreementId,
          supportItemNumber: item.supportItemNumber,
          supportItemName: cat.supportItemName,
          category: cat.supportCategory,
          unitPrice: item.unitPrice,
          allocatedQty: item.allocatedQty,
          allocatedBudget: Number(item.unitPrice) * Number(item.allocatedQty),
        };
      }),
    });
  }
}
