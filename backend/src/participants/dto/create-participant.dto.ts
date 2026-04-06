import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
  Matches,
  IsObject,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ManagementType } from '@prisma/client';

export class CreateParticipantDto {
  @ApiProperty({ example: '123456789' })
  @IsString()
  @Matches(/^\d{9}$/, { message: 'NDIS number must be exactly 9 digits' })
  ndisNumber: string;

  @ApiProperty({ example: 'Sarah' })
  @IsString()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Thompson' })
  @IsString()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: '1990-05-15' })
  @IsDateString()
  dateOfBirth: string;

  @ApiPropertyOptional({ example: 'sarah@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '0412345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  address?: {
    street: string;
    suburb: string;
    state: string;
    postcode: string;
  };

  @ApiProperty({ enum: ManagementType, example: 'PLAN_MANAGED' })
  @IsEnum(ManagementType)
  managementType: ManagementType;

  @ApiPropertyOptional({ example: 'Plan Partners Pty Ltd' })
  @IsOptional()
  @IsString()
  planManagerName?: string;

  @ApiPropertyOptional({ example: 'claims@planpartners.com.au' })
  @IsOptional()
  @IsEmail()
  planManagerEmail?: string;

  @ApiPropertyOptional({ example: 'Michael Brown' })
  @IsOptional()
  @IsString()
  supportCoordinatorName?: string;

  @ApiPropertyOptional({ example: 'michael@supportcoord.com.au' })
  @IsOptional()
  @IsEmail()
  supportCoordinatorEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
