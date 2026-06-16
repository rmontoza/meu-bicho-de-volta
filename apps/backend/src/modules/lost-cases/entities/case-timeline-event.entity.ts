import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TimelineEventType } from '../../../common/enums';
import { LostPetCase } from './lost-pet-case.entity';

@Entity('case_timeline_events')
export class CaseTimelineEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => LostPetCase, (lostCase) => lostCase.timeline, { onDelete: 'CASCADE' })
  lostCase: LostPetCase;

  @Column()
  lostCaseId: string;

  @Column({ type: 'enum', enum: TimelineEventType })
  eventType: TimelineEventType;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
