import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  Prisma,
  InvoiceStatus,
  BillingTarget,
  ManagementType,
  ShiftStatus,
} from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { GenerateInvoicesDto } from './dto/generate-invoices.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { QueryInvoicesDto } from './dto/query-invoices.dto';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async generateFromShifts(organisationId: string, dto: GenerateInvoicesDto) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    endDate.setHours(23, 59, 59, 999);

    const shifts = await this.prisma.shift.findMany({
      where: {
        organisationId,
        status: ShiftStatus.COMPLETED,
        actualEnd: { gte: startDate, lte: endDate },
        billableHours: { gt: 0 },
        invoiceLineItems: { none: {} },
        ...(dto.participantIds && { participantId: { in: dto.participantIds } }),
      },
      include: {
        participant: true,
        serviceAgreementItem: true,
      },
      orderBy: [{ participantId: 'asc' }, { actualEnd: 'asc' }],
    });

    if (shifts.length === 0) {
      return {
        invoicesCreated: 0,
        message: 'No uninvoiced completed shifts found in the specified date range',
      };
    }

    const shiftsByParticipant = new Map<string, typeof shifts>();
    for (const shift of shifts) {
      const list = shiftsByParticipant.get(shift.participantId) || [];
      list.push(shift);
      shiftsByParticipant.set(shift.participantId, list);
    }

    const invoicesCreated: Array<{ id: string; invoiceNumber: string; total: number }> = [];

    for (const [participantId, participantShifts] of shiftsByParticipant) {
      const participant = participantShifts[0].participant;

      const billingTarget = this.deriveBillingTarget(participant.managementType);
      const billingEmail =
        billingTarget === BillingTarget.PLAN_MANAGER
          ? participant.planManagerEmail
          : participant.email;

      let subtotal = 0;
      const lineItemData: Prisma.InvoiceLineItemCreateManyInvoiceInput[] = [];

      for (const shift of participantShifts) {
        const lineTotal =
          Number(shift.billableHours) * Number(shift.serviceAgreementItem.unitPrice);
        subtotal += lineTotal;

        lineItemData.push({
          shiftId: shift.id,
          serviceAgreementItemId: shift.serviceAgreementItemId,
          supportItemNumber: shift.serviceAgreementItem.supportItemNumber,
          description: shift.serviceAgreementItem.supportItemName,
          serviceDate: shift.actualEnd!,
          quantity: shift.billableHours!,
          unitPrice: shift.serviceAgreementItem.unitPrice,
          lineTotal,
          gstApplicable: false,
          claimType: 'STANDARD',
        });
      }

      const invoiceNumber = await this.generateInvoiceNumber(organisationId);
      const invoiceDate = new Date();
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + (dto.paymentTermsDays || 14));

      const invoice = await this.prisma.invoice.create({
        data: {
          organisationId,
          participantId,
          invoiceNumber,
          invoiceDate,
          dueDate,
          status: InvoiceStatus.DRAFT,
          billingTarget,
          billingEmail,
          subtotal,
          gst: 0,
          total: subtotal,
          lineItems: { createMany: { data: lineItemData } },
        },
      });

      invoicesCreated.push({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        total: Number(invoice.total),
      });
    }

    return {
      invoicesCreated: invoicesCreated.length,
      shiftsBilled: shifts.length,
      totalValue: invoicesCreated.reduce((sum, inv) => sum + inv.total, 0),
      invoices: invoicesCreated,
    };
  }

  async create(organisationId: string, dto: CreateInvoiceDto) {
    const participant = await this.prisma.participant.findFirst({
      where: { id: dto.participantId, organisationId, deletedAt: null },
    });
    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    if (!dto.lineItems || dto.lineItems.length === 0) {
      throw new BadRequestException('Invoice must have at least one line item');
    }

    let subtotal = 0;
    for (const item of dto.lineItems) {
      subtotal += Number(item.quantity) * Number(item.unitPrice);
    }

    const invoiceNumber = await this.generateInvoiceNumber(organisationId);
    const billingTarget = this.deriveBillingTarget(participant.managementType);

    return this.prisma.invoice.create({
      data: {
        organisationId,
        participantId: dto.participantId,
        invoiceNumber,
        invoiceDate: new Date(dto.invoiceDate),
        dueDate: new Date(dto.dueDate),
        status: InvoiceStatus.DRAFT,
        billingTarget,
        billingEmail:
          billingTarget === BillingTarget.PLAN_MANAGER
            ? participant.planManagerEmail
            : participant.email,
        subtotal,
        gst: 0,
        total: subtotal,
        lineItems: {
          createMany: {
            data: dto.lineItems.map((item) => ({
              serviceAgreementItemId: item.serviceAgreementItemId,
              supportItemNumber: item.supportItemNumber,
              description: item.description,
              serviceDate: new Date(item.serviceDate),
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: Number(item.quantity) * Number(item.unitPrice),
              gstApplicable: false,
              claimType: 'STANDARD',
            })),
          },
        },
      },
      include: { lineItems: true },
    });
  }

  async findAll(organisationId: string, query: QueryInvoicesDto) {
    const {
      participantId,
      status,
      billingTarget,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = query;

    const where: Prisma.InvoiceWhereInput = {
      organisationId,
      ...(participantId && { participantId }),
      ...(status && { status }),
      ...(billingTarget && { billingTarget }),
      ...(startDate && endDate && {
        invoiceDate: { gte: new Date(startDate), lte: new Date(endDate) },
      }),
    };

    const [invoices, total, totals] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: {
          participant: { select: { id: true, firstName: true, lastName: true, ndisNumber: true } },
          _count: { select: { lineItems: true } },
        },
        orderBy: { invoiceDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.invoice.count({ where }),
      this.prisma.invoice.aggregate({
        where,
        _sum: { total: true, paidAmount: true },
      }),
    ]);

    return {
      data: invoices,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        sumTotal: Number(totals._sum.total || 0),
        sumPaid: Number(totals._sum.paidAmount || 0),
        sumOutstanding: Number(totals._sum.total || 0) - Number(totals._sum.paidAmount || 0),
      },
    };
  }

  async findOne(organisationId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, organisationId },
      include: {
        participant: true,
        lineItems: {
          include: {
            shift: { select: { id: true, scheduledStart: true, actualStart: true, actualEnd: true } },
            serviceAgreementItem: { select: { supportItemName: true } },
          },
          orderBy: { serviceDate: 'asc' },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async update(organisationId: string, id: string, dto: UpdateInvoiceDto) {
    const invoice = await this.findOne(organisationId, id);

    if (invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.VOID) {
      throw new BadRequestException(
        `Cannot modify a ${invoice.status.toLowerCase()} invoice`,
      );
    }

    return this.prisma.invoice.update({
      where: { id },
      data: {
        ...(dto.invoiceDate && { invoiceDate: new Date(dto.invoiceDate) }),
        ...(dto.dueDate && { dueDate: new Date(dto.dueDate) }),
        ...(dto.billingEmail !== undefined && { billingEmail: dto.billingEmail }),
        ...(dto.status && { status: dto.status }),
      },
    });
  }

  async send(organisationId: string, id: string) {
    const invoice = await this.findOne(organisationId, id);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be sent');
    }

    if (!invoice.billingEmail && invoice.billingTarget !== BillingTarget.NDIA) {
      throw new BadRequestException('Cannot send invoice: no billing email on file');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.SENT,
        sentAt: new Date(),
      },
    });
  }

  async recordPayment(organisationId: string, id: string, dto: RecordPaymentDto) {
    const invoice = await this.findOne(organisationId, id);

    if (invoice.status === InvoiceStatus.VOID) {
      throw new BadRequestException('Cannot record payment on a void invoice');
    }

    const newPaidAmount = Number(invoice.paidAmount) + Number(dto.amount);
    const total = Number(invoice.total);

    if (newPaidAmount > total + 0.01) {
      throw new BadRequestException(
        `Payment amount $${dto.amount} would exceed invoice total of $${total.toFixed(2)}`,
      );
    }

    let newStatus: InvoiceStatus = invoice.status;
    let paidAt: Date | null = invoice.paidAt;

    if (Math.abs(newPaidAmount - total) < 0.01) {
      newStatus = InvoiceStatus.PAID;
      paidAt = dto.paymentDate ? new Date(dto.paymentDate) : new Date();
    } else if (newPaidAmount > 0) {
      newStatus = InvoiceStatus.PARTIALLY_PAID;
    }

    return this.prisma.invoice.update({
      where: { id },
      data: { paidAmount: newPaidAmount, status: newStatus, paidAt },
    });
  }

  async voidInvoice(organisationId: string, id: string) {
    const invoice = await this.findOne(organisationId, id);

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot void a paid invoice');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.VOID },
    });
  }

  async exportPrdaBulkClaimCsv(organisationId: string, invoiceIds: string[]) {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        id: { in: invoiceIds },
        organisationId,
        billingTarget: BillingTarget.NDIA,
        status: { in: [InvoiceStatus.SENT, InvoiceStatus.DRAFT] },
      },
      include: {
        participant: true,
        lineItems: { orderBy: { serviceDate: 'asc' } },
      },
    });

    if (invoices.length === 0) {
      throw new BadRequestException(
        'No eligible NDIA-managed invoices found for the provided IDs',
      );
    }

    const headers = [
      'RegistrationNumber',
      'NDISNumber',
      'SupportsDeliveredFrom',
      'SupportsDeliveredTo',
      'SupportNumber',
      'ClaimReference',
      'Quantity',
      'Hours',
      'UnitPrice',
      'GSTCode',
      'AuthorisedBy',
      'ParticipantApproved',
      'InKindFundingProgram',
      'ClaimType',
      'CancellationReason',
      'ABN of Support Provider',
    ];

    const rows: string[][] = [headers];
    let claimRef = 1;

    for (const invoice of invoices) {
      for (const item of invoice.lineItems) {
        const serviceDate = new Date(item.serviceDate).toISOString().slice(0, 10);
        const isHourly =
          item.supportItemNumber.includes('_0107_') || item.supportItemNumber.includes('_0125_');

        rows.push([
          '',
          invoice.participant.ndisNumber,
          serviceDate,
          serviceDate,
          item.supportItemNumber,
          `${invoice.invoiceNumber}-${claimRef}`,
          isHourly ? '' : Number(item.quantity).toFixed(2),
          isHourly ? Number(item.quantity).toFixed(2) : '',
          Number(item.unitPrice).toFixed(2),
          'P2',
          'Y',
          'Y',
          '',
          item.claimType || 'STANDARD',
          '',
          '',
        ]);
        claimRef++;
      }
    }

    const csv = rows
      .map((row) => row.map((cell) => this.escapeCsvCell(cell)).join(','))
      .join('\n');

    return {
      filename: `proda-bulk-claim-${new Date().toISOString().slice(0, 10)}.csv`,
      contentType: 'text/csv',
      content: csv,
      lineCount: rows.length - 1,
      invoiceCount: invoices.length,
    };
  }

  async getOutstandingSummary(organisationId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        organisationId,
        status: { in: [InvoiceStatus.SENT, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE] },
      },
      select: {
        id: true,
        invoiceNumber: true,
        invoiceDate: true,
        dueDate: true,
        total: true,
        paidAmount: true,
        billingTarget: true,
        participant: { select: { firstName: true, lastName: true } },
      },
    });

    const today = new Date();
    const buckets = {
      current: 0,
      days1to30: 0,
      days31to60: 0,
      days61to90: 0,
      over90: 0,
    };

    for (const inv of invoices) {
      const outstanding = Number(inv.total) - Number(inv.paidAmount);
      const daysOverdue = Math.floor((today.getTime() - new Date(inv.dueDate).getTime()) / 86400000);

      if (daysOverdue <= 0) buckets.current += outstanding;
      else if (daysOverdue <= 30) buckets.days1to30 += outstanding;
      else if (daysOverdue <= 60) buckets.days31to60 += outstanding;
      else if (daysOverdue <= 90) buckets.days61to90 += outstanding;
      else buckets.over90 += outstanding;
    }

    return {
      totalOutstanding: Object.values(buckets).reduce((a, b) => a + b, 0),
      invoiceCount: invoices.length,
      ageingBuckets: buckets,
    };
  }

  private async generateInvoiceNumber(organisationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;

    const lastInvoice = await this.prisma.invoice.findFirst({
      where: {
        organisationId,
        invoiceNumber: { startsWith: prefix },
      },
      orderBy: { invoiceNumber: 'desc' },
      select: { invoiceNumber: true },
    });

    let nextNumber = 1;
    if (lastInvoice) {
      const lastNum = parseInt(lastInvoice.invoiceNumber.replace(prefix, ''), 10);
      if (!isNaN(lastNum)) nextNumber = lastNum + 1;
    }

    return `${prefix}${String(nextNumber).padStart(5, '0')}`;
  }

  private deriveBillingTarget(managementType: ManagementType): BillingTarget {
    switch (managementType) {
      case ManagementType.NDIA_MANAGED:
        return BillingTarget.NDIA;
      case ManagementType.PLAN_MANAGED:
        return BillingTarget.PLAN_MANAGER;
      case ManagementType.SELF_MANAGED:
        return BillingTarget.SELF_MANAGED;
    }
  }

  private escapeCsvCell(value: string): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }
}
