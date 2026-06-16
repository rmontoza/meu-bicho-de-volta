import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '../notifications/notifications.module';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message]),
    NotificationsModule,
  ],
  controllers: [MessagingController],
  providers: [MessagingService],
})
export class MessagingModule {}
