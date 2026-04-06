import { IsOptional, IsDateString, IsEmail, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus } from '@prisma/client';

export class UpdateInvoiceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  invoiceDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  billingEmail?: string;

  @ApiPropertyOptional({ enum: InvoiceStatus })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;
}
