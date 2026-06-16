import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagingService } from './messaging.service';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/conversations')
export class MessagingController {
  constructor(private messagingService: MessagingService) {}

  @Post()
  start(@CurrentUser() user: User, @Body() dto: CreateConversationDto) {
    return this.messagingService.startConversation(user, dto);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.messagingService.findMyConversations(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.messagingService.findOne(id, user.id);
  }

  @Post(':id/messages')
  sendMessage(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagingService.sendMessage(id, user, dto);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @CurrentUser() user: User) {
    return this.messagingService.markAsRead(id, user.id);
  }

  @Patch(':id/close')
  close(@Param('id') id: string, @CurrentUser() user: User) {
    return this.messagingService.closeConversation(id, user.id);
  }
}
