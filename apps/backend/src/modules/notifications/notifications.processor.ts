import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Job } from 'bull';
import { Repository } from 'typeorm';
import { UserDevice } from '../users/entities/user-device.entity';
import { NOTIFICATIONS_QUEUE } from './notifications.service';

@Processor(NOTIFICATIONS_QUEUE)
export class NotificationsProcessor {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(
    @InjectRepository(UserDevice) private devicesRepo: Repository<UserDevice>,
  ) {}

  @Process('send-push')
  async handleSendPush(job: Job<{ notificationId: string; userId: string; title: string; body: string; imageUrl?: string }>) {
    const { userId, title, notificationId } = job.data;

    const devices = await this.devicesRepo.find({
      where: { userId, pushEnabled: true },
    });

    if (devices.length === 0) {
      this.logger.debug(`No devices for user ${userId}`);
      return;
    }

    const tokens = devices.map((d) => d.pushToken).filter(Boolean);

    // FCM integration placeholder — substitua pela SDK do Firebase Admin quando configurar a chave
    this.logger.log(
      `[FCM] Sending push to ${tokens.length} device(s) for notification ${notificationId}: "${title}"`,
    );
  }
}
