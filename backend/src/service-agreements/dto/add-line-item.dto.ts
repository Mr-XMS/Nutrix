import { IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddLineItemDto {
  @ApiProperty({ example: '01_011_0107_1_1' })
  @IsString()
  supportItemNumber: string;

  @ApiProperty({ example: 67.56, description: 'Agreed unit price (must be ≤ NDIS price limit)' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice: number;

  @ApiProperty({ example: 100, description: 'Allocated quantity (hours/units)' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  allocatedQty: number;
}
