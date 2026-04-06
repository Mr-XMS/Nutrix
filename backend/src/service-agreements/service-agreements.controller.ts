import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole, AgreementStatus } from '@prisma/client';
import { ServiceAgreementsService } from './service-agreements.service';
import { CreateServiceAgreementDto } from './dto/create-service-agreement.dto';
import { UpdateServiceAgreementDto } from './dto/update-service-agreement.dto';
import { AddLineItemDto } from './dto/add-line-item.dto';
import { OrgId } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Service Agreements')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('service-agreements')
export class ServiceAgreementsController {
  constructor(private serviceAgreementsService: ServiceAgreementsService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.COORDINATOR)
  @ApiOperation({ summary: 'Create a new service agreement' })
  create(@OrgId() orgId: string, @Body() dto: CreateServiceAgreementDto) {
    return this.serviceAgreementsService.create(orgId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List service agreements with optional filters' })
  findAll(
    @OrgId() orgId: string,
    @Query('participantId') participantId?: string,
    @Query('status') status?: AgreementStatus,
  ) {
    return this.serviceAgreementsService.findAll(orgId, participantId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service agreement details' })
  findOne(@OrgId() orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.serviceAgreementsService.findOne(orgId, id);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.COORDINATOR)
  @ApiOperation({ summary: 'Update service agreement' })
  update(
    @OrgId() orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceAgreementDto,
  ) {
    return this.serviceAgreementsService.update(orgId, id, dto);
  }

  @Post(':id/activate')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.COORDINATOR)
  @ApiOperation({ summary: 'Activate a draft service agreement' })
  activate(@OrgId() orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.serviceAgreementsService.activate(orgId, id);
  }

  @Post(':id/cancel')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Cancel a service agreement' })
  cancel(@OrgId() orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.serviceAgreementsService.cancel(orgId, id);
  }

  @Post(':id/line-items')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.COORDINATOR)
  @ApiOperation({ summary: 'Add a line item to a service agreement' })
  addLineItem(
    @OrgId() orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddLineItemDto,
  ) {
    return this.serviceAgreementsService.addLineItem(orgId, id, dto);
  }

  @Delete(':id/line-items/:itemId')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.COORDINATOR)
  @ApiOperation({ summary: 'Remove a line item from a service agreement' })
  removeLineItem(
    @OrgId() orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    return this.serviceAgreementsService.removeLineItem(orgId, id, itemId);
  }
}
