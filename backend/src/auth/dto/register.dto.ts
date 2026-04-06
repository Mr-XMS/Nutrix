import { IsEmail, IsString, MinLength, MaxLength, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Care Solutions Pty Ltd' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  organisationName: string;

  @ApiProperty({ example: 'jane@caresolutions.com.au' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiProperty({ example: 'Jane' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Mitchell' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName: string;

  @ApiPropertyOptional({ example: '12345678901' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{11}$/, { message: 'ABN must be exactly 11 digits' })
  abn?: string;

  @ApiPropertyOptional({ example: '4-ABC-1234' })
  @IsOptional()
  @IsString()
  ndisRegistrationNo?: string;
}
