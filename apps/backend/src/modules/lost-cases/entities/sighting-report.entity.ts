import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SightingCertainty } from '../../../common/enums';
import { User } from '../../users/entities/user.entity';
import { LostPetCase } from './lost-pet-case.entity';

@Entity('sighting_reports')
export class SightingReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => LostPetCase, (lostCase) => lostCase.sightings, { onDelete: 'CASCADE' })
  lostCase: LostPetCase;

  @Column()
  lostCaseId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  reportedBy: User;

  @Column()
  reportedByUserId: string;

  @Column({ nullable: true })
  seenAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ nullable: true })
  addressText: string;

  @Column({ type: 'enum', enum: SightingCertainty, default: SightingCertainty.MEDIUM })
  certaintyLevel: SightingCertainty;

  @Column({ nullable: true, type: 'text' })
  comment: string;

  @Column({ nullable: true })
  photoUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}
