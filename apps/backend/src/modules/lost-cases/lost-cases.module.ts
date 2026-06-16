import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeoModule } from '../geo/geo.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CaseTimelineEvent } from './entities/case-timeline-event.entity';
import { LostPetCase } from './entities/lost-pet-case.entity';
import { SightingReport } from './entities/sighting-report.entity';
import { LostCasesController } from './lost-cases.controller';
import { LostCasesService } from './lost-cases.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([LostPetCase, CaseTimelineEvent, SightingReport]),
    GeoModule,
    NotificationsModule,
  ],
  controllers: [LostCasesController],
  providers: [LostCasesService],
  exports: [LostCasesService],
})
export class LostCasesModule {}
