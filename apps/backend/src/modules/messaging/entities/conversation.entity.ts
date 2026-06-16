import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CaseType, ConversationStatus } from '../../../common/enums';
import { User } from '../../users/entities/user.entity';
import { Message } from './message.entity';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  caseId: string;

  @Column({ type: 'enum', enum: CaseType })
  caseType: CaseType;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  owner: User;

  @Column()
  ownerUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  participant: User;

  @Column()
  participantUserId: string;

  @Column({ type: 'enum', enum: ConversationStatus, default: ConversationStatus.ACTIVE })
  status: ConversationStatus;

  @OneToMany(() => Message, (message) => message.conversation, { cascade: true })
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
