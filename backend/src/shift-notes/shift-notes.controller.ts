import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ShiftNotesService } from './shift-notes.service';

@ApiTags('ShiftNotes')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('shift-notes')
export class ShiftNotesController {
  constructor(private service: ShiftNotesService) {}
}
