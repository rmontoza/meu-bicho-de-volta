import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Job } from 'bull';
import { In, Repository } from 'typeorm';
import { UserDevice } from '../users/entities/user-device.entity';
import { FcmService } from './fcm.service';
import { NOTIFICATIONS_QUEUE } from './notifications.service';

@Processor(NOTIFICATIONS_QUEUE)
export class NotificationsProcessor {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(
    @InjectRepository(UserDevice) private devicesRepo: Repository<UserDevice>,
    private fcmService: FcmService,
  ) {}

  @Process('send-push')
  async handleSendPush(
    job: Job<{
      notificationId: string;
      userId: string;
      title: string;
      body: string;
      imageUrl?: string;
      relatedEntityType?: string;
      relatedEntityId?: string;
    }>,
  ) {
    const { userId, title, body, imageUrl, notificationId, relatedEntityType, relatedEntityId } =
      job.data;

    const devices = await this.devicesRepo.find({
      where: { userId, pushEnabled: true },
    });

    const tokens = devices.map((d) => d.pushToken).filter((t): t is string => !!t);

    if (tokens.length === 0) {
      this.logger.debug(`[FCM] Nenhum token para userId=${userId}`);
      return;
    }

    if (!this.fcmService.isReady) {
      this.logger.debug(`[FCM] SDK não inicializado — notificação ${notificationId} ignorada`);
      return;
    }

    const data: Record<string, string> = {};
    if (relatedEntityType) data.entityType = relatedEntityType;
    if (relatedEntityId) data.entityId = relatedEntityId;

    const result = await this.fcmService.sendMulticast({ tokens, title, body, imageUrl, data });

    this.logger.log(
      `[FCM] notif=${notificationId} user=${userId} enviadas=${result.sent} falhas=${result.failed}`,
    );

    // Remove tokens inválidos do banco para não tentar novamente
    if (result.invalidTokens.length > 0) {
      await this.devicesRepo.delete({
        userId,
        pushToken: In(result.invalidTokens),
      });
      this.logger.warn(
        `[FCM] ${result.invalidTokens.length} token(s) inválido(s) removidos para userId=${userId}`,
      );
    }
  }
}
