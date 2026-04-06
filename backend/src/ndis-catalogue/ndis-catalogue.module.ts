import { Module } from '@nestjs/common';
import { NdisCatalogueService } from './ndis-catalogue.service';
import { NdisCatalogueController } from './ndis-catalogue.controller';

@Module({
  controllers: [NdisCatalogueController],
  providers: [NdisCatalogueService],
  exports: [NdisCatalogueService],
})
export class NdisCatalogueModule {}
