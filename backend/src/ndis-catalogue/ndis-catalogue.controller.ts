import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FundingCategory } from '@prisma/client';
import { NdisCatalogueService } from './ndis-catalogue.service';

@ApiTags('NDIS Catalogue')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('ndis-catalogue')
export class NdisCatalogueController {
  constructor(private catalogueService: NdisCatalogueService) {}

  @Get()
  @ApiOperation({ summary: 'Search NDIS support catalogue items' })
  search(
    @Query('search') search?: string,
    @Query('category') category?: FundingCategory,
    @Query('registrationGroup') registrationGroup?: string,
    @Query('limit') limit?: number,
  ) {
    return this.catalogueService.search({ search, category, registrationGroup, limit });
  }

  @Get('registration-groups')
  @ApiOperation({ summary: 'List all registration groups' })
  getRegistrationGroups() {
    return this.catalogueService.getRegistrationGroups();
  }

  @Get(':supportItemNumber')
  @ApiOperation({ summary: 'Get a single support item by item number' })
  findOne(@Param('supportItemNumber') supportItemNumber: string) {
    return this.catalogueService.findByItemNumber(supportItemNumber);
  }
}
