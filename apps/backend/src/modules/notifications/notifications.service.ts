import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Queue } from 'bull';
import { Repository } from 'typeorm';
import { NotificationType } from '../../common/enums';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

export const NOTIFICATIONS_QUEUE = 'notifications';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private notificationsRepo: Repository<Notification>,
    @InjectQueue(NOTIFICATIONS_QUEUE) private notificationsQueue: Queue,
  ) {}

  async create(dto: CreateNotificationDto) {
    const notification = this.notificationsRepo.create(dto);
    const saved = await this.notificationsRepo.save(notification);

    await this.notificationsQueue.add('send-push', { notificationId: saved.id, ...dto });

    return saved;
  }

  async findByUser(userId: string) {
    return this.notificationsRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markAsRead(id: string, userId: string) {
    await this.notificationsRepo.update(
      { id, userId },
      { isRead: true, readAt: new Date() },
    );
    return { message: 'Notificação marcada como lida.' };
  }

  async markAllAsRead(userId: string) {
    await this.notificationsRepo.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
    return { message: 'Todas as notificações marcadas como lidas.' };
  }

  async notifyUsersNearby(
    userIds: string[],
    payload: {
      title: string;
      body: string;
      type: NotificationType;
      relatedEntityType?: string;
      relatedEntityId?: string;
      imageUrl?: string;
    },
  ) {
    for (const userId of userIds) {
      await this.create({ userId, ...payload });
    }
  }
}
