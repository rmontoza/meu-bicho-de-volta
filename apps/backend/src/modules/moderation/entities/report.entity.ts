import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ReportReason, ReportStatus, ReportTargetType } from '../../../common/enums';
import { User } from '../../users/entities/user.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  createdBy: User;

  @Column()
  createdByUserId: string;

  @Column({ type: 'enum', enum: ReportTargetType })
  targetType: ReportTargetType;

  @Column()
  targetId: string;

  @Column({ type: 'enum', enum: ReportReason })
  reason: ReportReason;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.OPEN })
  status: ReportStatus;

  @Column({ nullable: true })
  resolvedByAdminId: string;

  @Column({ nullable: true, type: 'text' })
  adminNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  resolvedAt: Date;
}
