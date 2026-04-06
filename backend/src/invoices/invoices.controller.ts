import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { InvoicesService } from './invoices.service';
import { GenerateInvoicesDto } from './dto/generate-invoices.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { ExportProdaCsvDto } from './dto/export-proda-csv.dto';
import { QueryInvoicesDto } from './dto/query-invoices.dto';
import { OrgId } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Invoices')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Post('generate')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.BILLING)
  @ApiOperation({
    summary: 'Auto-generate invoices from completed shifts in a date range',
  })
  generate(@OrgId() orgId: string, @Body() dto: GenerateInvoicesDto) {
    return this.invoicesService.generateFromShifts(orgId, dto);
  }

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.BILLING)
  @ApiOperation({ summary: 'Create an invoice manually' })
  create(@OrgId() orgId: string, @Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(orgId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List invoices with filters' })
  findAll(@OrgId() orgId: string, @Query() query: QueryInvoicesDto) {
    return this.invoicesService.findAll(orgId, query);
  }

  @Get('outstanding-summary')
  @ApiOperation({ summary: 'Get aged outstanding receivables summary' })
  outstandingSummary(@OrgId() orgId: string) {
    return this.invoicesService.getOutstandingSummary(orgId);
  }

  @Post('export-proda-csv')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.BILLING)
  @ApiOperation({
    summary: 'Export selected invoices as PRODA bulk claim CSV for NDIA upload',
  })
  async exportProdaCsv(
    @OrgId() orgId: string,
    @Body() dto: ExportProdaCsvDto,
    @Res() res: Response,
  ) {
    const result = await this.invoicesService.exportPrdaBulkClaimCsv(orgId, dto.invoiceIds);
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.content);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice with line items' })
  findOne(@OrgId() orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.invoicesService.findOne(orgId, id);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.BILLING)
  @ApiOperation({ summary: 'Update invoice (draft only)' })
  update(
    @OrgId() orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvoiceDto,
  ) {
    return this.invoicesService.update(orgId, id, dto);
  }

  @Post(':id/send')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.BILLING)
  @ApiOperation({ summary: 'Mark invoice as sent (DRAFT → SENT)' })
  send(@OrgId() orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.invoicesService.send(orgId, id);
  }

  @Post(':id/payment')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.BILLING)
  @ApiOperation({ summary: 'Record a payment against an invoice' })
  recordPayment(
    @OrgId() orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RecordPaymentDto,
  ) {
    return this.invoicesService.recordPayment(orgId, id, dto);
  }

  @Post(':id/void')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Void an invoice' })
  voidInvoice(@OrgId() orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.invoicesService.voidInvoice(orgId, id);
  }
}
