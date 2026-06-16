import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDevice } from '../users/entities/user-device.entity';
import { Notification } from './entities/notification.entity';
import { NotificationsController } from './notifications.controller';
import { NotificationsProcessor } from './notifications.processor';
import { NOTIFICATIONS_QUEUE, NotificationsService } from './notifications.service';
import { FcmService } from './fcm.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, UserDevice]),
    BullModule.registerQueue({ name: NOTIFICATIONS_QUEUE }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsProcessor, FcmService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
