import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationStatus, NotificationType } from '../../common/enums';
import { NotificationsService } from '../notifications/notifications.service';
import { User } from '../users/entities/user.entity';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessagingService {
  constructor(
    @InjectRepository(Conversation) private conversationsRepo: Repository<Conversation>,
    @InjectRepository(Message) private messagesRepo: Repository<Message>,
    private notificationsService: NotificationsService,
  ) {}

  async startConversation(participant: User, dto: CreateConversationDto) {
    if (participant.id === dto.ownerUserId) {
      throw new ConflictException('Você não pode iniciar uma conversa consigo mesmo.');
    }

    const existing = await this.conversationsRepo.findOne({
      where: {
        caseId: dto.caseId,
        ownerUserId: dto.ownerUserId,
        participantUserId: participant.id,
        status: ConversationStatus.ACTIVE,
      },
    });

    if (existing) return existing;

    const conversation = this.conversationsRepo.create({
      caseId: dto.caseId,
      caseType: dto.caseType,
      ownerUserId: dto.ownerUserId,
      participantUserId: participant.id,
    });

    return this.conversationsRepo.save(conversation);
  }

  async findMyConversations(userId: string) {
    return this.conversationsRepo.find({
      where: [
        { ownerUserId: userId },
        { participantUserId: userId },
      ],
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const conv = await this.conversationsRepo.findOne({
      where: { id },
      relations: { messages: true },
    });
    if (!conv) throw new NotFoundException('Conversa não encontrada.');
    this.assertParticipant(conv, userId);
    return conv;
  }

  async sendMessage(conversationId: string, sender: User, dto: SendMessageDto) {
    const conv = await this.conversationsRepo.findOne({ where: { id: conversationId } });
    if (!conv) throw new NotFoundException('Conversa não encontrada.');
    if (conv.status !== ConversationStatus.ACTIVE) {
      throw new ForbiddenException('Conversa encerrada.');
    }
    this.assertParticipant(conv, sender.id);

    const message = this.messagesRepo.create({
      conversationId,
      senderUserId: sender.id,
      body: dto.body,
      attachmentUrl: dto.attachmentUrl,
    });

    const saved = await this.messagesRepo.save(message);

    await this.conversationsRepo.update(conversationId, { updatedAt: new Date() });

    const recipientId =
      conv.ownerUserId === sender.id ? conv.participantUserId : conv.ownerUserId;

    await this.notificationsService.create({
      userId: recipientId,
      type: NotificationType.MESSAGE_RECEIVED,
      title: 'Nova mensagem',
      body: dto.body.length > 80 ? dto.body.slice(0, 80) + '…' : dto.body,
      relatedEntityType: 'conversation',
      relatedEntityId: conversationId,
    });

    return saved;
  }

  async markAsRead(conversationId: string, userId: string) {
    const conv = await this.conversationsRepo.findOne({ where: { id: conversationId } });
    if (!conv) throw new NotFoundException('Conversa não encontrada.');
    this.assertParticipant(conv, userId);

    await this.messagesRepo
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true })
      .where('conversationId = :conversationId AND senderUserId != :userId AND isRead = false', {
        conversationId,
        userId,
      })
      .execute();

    return { message: 'Mensagens marcadas como lidas.' };
  }

  async closeConversation(id: string, userId: string) {
    const conv = await this.conversationsRepo.findOne({ where: { id } });
    if (!conv) throw new NotFoundException('Conversa não encontrada.');
    this.assertParticipant(conv, userId);
    await this.conversationsRepo.update(id, { status: ConversationStatus.CLOSED });
    return { message: 'Conversa encerrada.' };
  }

  private assertParticipant(conv: Conversation, userId: string) {
    if (conv.ownerUserId !== userId && conv.participantUserId !== userId) {
      throw new ForbiddenException('Sem permissão.');
    }
  }
}
