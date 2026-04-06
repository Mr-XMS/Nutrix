import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, PlanStatus, FundingCategory } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { CreateNdisPlanDto } from './dto/create-ndis-plan.dto';
import { UpdateNdisPlanDto } from './dto/update-ndis-plan.dto';

@Injectable()
export class NdisPlansService {
  constructor(private prisma: PrismaService) {}

  async create(organisationId: string, dto: CreateNdisPlanDto) {
    const participant = await this.prisma.participant.findFirst({
      where: { id: dto.participantId, organisationId, deletedAt: null },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    const startDate = new Date(dto.planStartDate);
    const endDate = new Date(dto.planEndDate);

    if (endDate <= startDate) {
      throw new BadRequestException('Plan end date must be after start date');
    }

    const allocatedTotal =
      Number(dto.coreBudget || 0) +
      Number(dto.capacityBuildingBudget || 0) +
      Number(dto.capitalBudget || 0);

    if (Math.abs(allocatedTotal - Number(dto.totalBudget)) > 0.01) {
      throw new BadRequestException(
        `Sum of category budgets ($${allocatedTotal.toFixed(2)}) does not match total budget ($${Number(dto.totalBudget).toFixed(2)})`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.ndisPlan.updateMany({
        where: {
          participantId: dto.participantId,
          status: PlanStatus.ACTIVE,
        },
        data: { status: PlanStatus.SUPERSEDED },
      });

      const plan = await tx.ndisPlan.create({
        data: {
          participantId: dto.participantId,
          planStartDate: startDate,
          planEndDate: endDate,
          status: PlanStatus.ACTIVE,
          totalBudget: dto.totalBudget,
          coreBudget: dto.coreBudget || 0,
          capacityBuildingBudget: dto.capacityBuildingBudget || 0,
          capitalBudget: dto.capitalBudget || 0,
          notes: dto.notes,
        },
      });

      const fundingPeriods = this.generateFundingPeriods(plan.id, startDate, endDate, {
        core: Number(dto.coreBudget || 0),
        capacityBuilding: Number(dto.capacityBuildingBudget || 0),
        capital: Number(dto.capitalBudget || 0),
      });

      if (fundingPeriods.length > 0) {
        await tx.fundingPeriod.createMany({ data: fundingPeriods });
      }

      return tx.ndisPlan.findUnique({
        where: { id: plan.id },
        include: { fundingPeriods: true },
      });
    });
  }

  async findAllForParticipant(organisationId: string, participantId: string) {
    const participant = await this.prisma.participant.findFirst({
      where: { id: participantId, organisationId, deletedAt: null },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    return this.prisma.ndisPlan.findMany({
      where: { participantId },
      include: {
        fundingPeriods: { orderBy: { periodStartDate: 'asc' } },
        serviceAgreements: {
          include: { lineItems: true },
          orderBy: { startDate: 'desc' },
        },
      },
      orderBy: { planStartDate: 'desc' },
    });
  }

  async findOne(organisationId: string, id: string) {
    const plan = await this.prisma.ndisPlan.findFirst({
      where: {
        id,
        participant: { organisationId, deletedAt: null },
      },
      include: {
        participant: true,
        fundingPeriods: { orderBy: { periodStartDate: 'asc' } },
        serviceAgreements: {
          include: { lineItems: true },
          orderBy: { startDate: 'desc' },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('NDIS plan not found');
    }

    return plan;
  }

  async update(organisationId: string, id: string, dto: UpdateNdisPlanDto) {
    await this.findOne(organisationId, id);

    const updateData: Prisma.NdisPlanUpdateInput = {};

    if (dto.planStartDate) updateData.planStartDate = new Date(dto.planStartDate);
    if (dto.planEndDate) updateData.planEndDate = new Date(dto.planEndDate);
    if (dto.totalBudget !== undefined) updateData.totalBudget = dto.totalBudget;
    if (dto.coreBudget !== undefined) updateData.coreBudget = dto.coreBudget;
    if (dto.capacityBuildingBudget !== undefined) updateData.capacityBuildingBudget = dto.capacityBuildingBudget;
    if (dto.capitalBudget !== undefined) updateData.capitalBudget = dto.capitalBudget;
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (dto.status) updateData.status = dto.status;

    return this.prisma.ndisPlan.update({
      where: { id },
      data: updateData,
      include: { fundingPeriods: true },
    });
  }

  async getBudgetSummary(organisationId: string, id: string) {
    const plan = await this.findOne(organisationId, id);

    const summary = {
      planId: plan.id,
      totalBudget: Number(plan.totalBudget),
      categories: {
        core: {
          allocated: Number(plan.coreBudget),
          delivered: 0,
          remaining: Number(plan.coreBudget),
          percentSpent: 0,
        },
        capacityBuilding: {
          allocated: Number(plan.capacityBuildingBudget),
          delivered: 0,
          remaining: Number(plan.capacityBuildingBudget),
          percentSpent: 0,
        },
        capital: {
          allocated: Number(plan.capitalBudget),
          delivered: 0,
          remaining: Number(plan.capitalBudget),
          percentSpent: 0,
        },
      },
      fundingPeriods: plan.fundingPeriods.map((fp) => ({
        id: fp.id,
        category: fp.category,
        periodStartDate: fp.periodStartDate,
        periodEndDate: fp.periodEndDate,
        allocated: Number(fp.allocatedAmount),
        spent: Number(fp.spentAmount),
        remaining: Number(fp.allocatedAmount) - Number(fp.spentAmount),
        percentSpent:
          Number(fp.allocatedAmount) > 0
            ? (Number(fp.spentAmount) / Number(fp.allocatedAmount)) * 100
            : 0,
      })),
    };

    for (const sa of plan.serviceAgreements) {
      for (const item of sa.lineItems) {
        const categoryKey =
          item.category === 'CORE'
            ? 'core'
            : item.category === 'CAPACITY_BUILDING'
              ? 'capacityBuilding'
              : 'capital';
        summary.categories[categoryKey].delivered += Number(item.deliveredBudget);
      }
    }

    for (const cat of Object.values(summary.categories)) {
      cat.remaining = cat.allocated - cat.delivered;
      cat.percentSpent = cat.allocated > 0 ? (cat.delivered / cat.allocated) * 100 : 0;
    }

    return summary;
  }

  async getActivePlanForParticipant(participantId: string) {
    return this.prisma.ndisPlan.findFirst({
      where: {
        participantId,
        status: PlanStatus.ACTIVE,
      },
      include: { fundingPeriods: true },
    });
  }

  private generateFundingPeriods(
    ndisPlanId: string,
    planStart: Date,
    planEnd: Date,
    budgets: { core: number; capacityBuilding: number; capital: number },
  ): Prisma.FundingPeriodCreateManyInput[] {
    const periods: Prisma.FundingPeriodCreateManyInput[] = [];

    const categoryConfig: Array<{
      category: FundingCategory;
      total: number;
      monthsPerPeriod: number;
    }> = [
      { category: FundingCategory.CORE, total: budgets.core, monthsPerPeriod: 3 },
      {
        category: FundingCategory.CAPACITY_BUILDING,
        total: budgets.capacityBuilding,
        monthsPerPeriod: 3,
      },
      { category: FundingCategory.CAPITAL, total: budgets.capital, monthsPerPeriod: 12 },
    ];

    for (const config of categoryConfig) {
      if (config.total <= 0) continue;

      const totalMonths = this.monthsBetween(planStart, planEnd);
      const numPeriods = Math.max(1, Math.ceil(totalMonths / config.monthsPerPeriod));
      const amountPerPeriod = config.total / numPeriods;

      let periodStart = new Date(planStart);

      for (let i = 0; i < numPeriods; i++) {
        const periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodEnd.getMonth() + config.monthsPerPeriod);
        periodEnd.setDate(periodEnd.getDate() - 1);

        const cappedEnd = periodEnd > planEnd ? planEnd : periodEnd;

        periods.push({
          ndisPlanId,
          category: config.category,
          periodStartDate: new Date(periodStart),
          periodEndDate: cappedEnd,
          allocatedAmount: i === numPeriods - 1
            ? config.total - amountPerPeriod * (numPeriods - 1)
            : amountPerPeriod,
          spentAmount: 0,
        });

        periodStart = new Date(cappedEnd);
        periodStart.setDate(periodStart.getDate() + 1);
      }
    }

    return periods;
  }

  private monthsBetween(start: Date, end: Date): number {
    return (
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth())
    );
  }
}
