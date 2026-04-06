import { Module } from '@nestjs/common';
import { ServiceAgreementsService } from './service-agreements.service';
import { ServiceAgreementsController } from './service-agreements.controller';

@Module({
  controllers: [ServiceAgreementsController],
  providers: [ServiceAgreementsService],
  exports: [ServiceAgreementsService],
})
export class ServiceAgreementsModule {}
