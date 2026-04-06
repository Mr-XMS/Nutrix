import {
  IsUUID,
  IsDateString,
  IsArray,
  ValidateNested,
  IsString,
  IsNumber,
  Min,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class InvoiceLineItemDto {
  @ApiProperty()
  @IsUUID()
  serviceAgreementItemId: string;

  @ApiProperty({ example: '01_011_0107_1_1' })
  @IsString()
  supportItemNumber: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ example: '2026-04-15' })
  @IsDateString()
  serviceDate: string;

  @ApiProperty({ example: 4 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  quantity: number;

  @ApiProperty({ example: 67.56 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice: number;
}

export class CreateInvoiceDto {
  @ApiProperty()
  @IsUUID()
  participantId: string;

  @ApiProperty({ example: '2026-04-30' })
  @IsDateString()
  invoiceDate: string;

  @ApiProperty({ example: '2026-05-14' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ type: [InvoiceLineItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineItemDto)
  lineItems: InvoiceLineItemDto[];
}
