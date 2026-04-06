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
import { UserRole } from '@prisma/client';
import { ParticipantsService } from './participants.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { QueryParticipantsDto } from './dto/query-participants.dto';
import { OrgId } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Participants')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('participants')
export class ParticipantsController {
  constructor(private participantsService: ParticipantsService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.COORDINATOR)
  @ApiOperation({ summary: 'Create a new participant' })
  create(@OrgId() orgId: string, @Body() dto: CreateParticipantDto) {
    return this.participantsService.create(orgId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List participants with search and pagination' })
  findAll(@OrgId() orgId: string, @Query() query: QueryParticipantsDto) {
    return this.participantsService.findAll(orgId, query);
  }

  @Get('expiring-plans')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.COORDINATOR)
  @ApiOperation({ summary: 'Get participants with plans expiring soon' })
  getExpiringPlans(
    @OrgId() orgId: string,
    @Query('days') days?: number,
  ) {
    return this.participantsService.getExpiringPlans(orgId, days || 30);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get participant details with plans and agreements' })
  findOne(@OrgId() orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.participantsService.findOne(orgId, id);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.COORDINATOR)
  @ApiOperation({ summary: 'Update participant details' })
  update(
    @OrgId() orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateParticipantDto,
  ) {
    return this.participantsService.update(orgId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Soft delete a participant' })
  remove(@OrgId() orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.participantsService.softDelete(orgId, id);
  }

  @Post('import')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.COORDINATOR)
  @ApiOperation({ summary: 'Bulk import participants from CSV data' })
  importCsv(@OrgId() orgId: string, @Body() body: { rows: CreateParticipantDto[] }) {
    return this.participantsService.importCsv(orgId, body.rows);
  }
}
