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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { NdisPlansService } from './ndis-plans.service';
import { CreateNdisPlanDto } from './dto/create-ndis-plan.dto';
import { UpdateNdisPlanDto } from './dto/update-ndis-plan.dto';
import { OrgId } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('NDIS Plans')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('ndis-plans')
export class NdisPlansController {
  constructor(private ndisPlansService: NdisPlansService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.COORDINATOR)
  @ApiOperation({ summary: 'Create a new NDIS plan for a participant' })
  create(@OrgId() orgId: string, @Body() dto: CreateNdisPlanDto) {
    return this.ndisPlansService.create(orgId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List NDIS plans for a participant' })
  findAll(@OrgId() orgId: string, @Query('participantId', ParseUUIDPipe) participantId: string) {
    return this.ndisPlansService.findAllForParticipant(orgId, participantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get NDIS plan with funding periods and agreements' })
  findOne(@OrgId() orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.ndisPlansService.findOne(orgId, id);
  }

  @Get(':id/budget-summary')
  @ApiOperation({ summary: 'Get plan budget summary by category and funding period' })
  getBudgetSummary(@OrgId() orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.ndisPlansService.getBudgetSummary(orgId, id);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.COORDINATOR)
  @ApiOperation({ summary: 'Update NDIS plan' })
  update(
    @OrgId() orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNdisPlanDto,
  ) {
    return this.ndisPlansService.update(orgId, id, dto);
  }
}
