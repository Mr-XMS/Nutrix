import { Module } from '@nestjs/common';
import { ShiftNotesService } from './shift-notes.service';
import { ShiftNotesController } from './shift-notes.controller';

@Module({
  controllers: [ShiftNotesController],
  providers: [ShiftNotesService],
  exports: [ShiftNotesService],
})
export class ShiftNotesModule {}
