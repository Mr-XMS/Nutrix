import { Module } from '@nestjs/common';
import { NdisPlansService } from './ndis-plans.service';
import { NdisPlansController } from './ndis-plans.controller';

@Module({
  controllers: [NdisPlansController],
  providers: [NdisPlansService],
  exports: [NdisPlansService],
})
export class NdisPlansModule {}
