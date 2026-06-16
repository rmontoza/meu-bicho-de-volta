import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Conversation } from './conversation.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, { onDelete: 'CASCADE' })
  conversation: Conversation;

  @Column()
  conversationId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  sender: User;

  @Column()
  senderUserId: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ nullable: true })
  attachmentUrl: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
