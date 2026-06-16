import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CaseStatus } from '../../../common/enums';
import { Pet } from '../../pets/entities/pet.entity';
import { User } from '../../users/entities/user.entity';
import { CaseTimelineEvent } from './case-timeline-event.entity';
import { SightingReport } from './sighting-report.entity';

@Entity('lost_pet_cases')
export class LostPetCase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pet, { onDelete: 'SET NULL', nullable: true })
  pet: Pet;

  @Column({ nullable: true })
  petId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  owner: User;

  @Column()
  ownerId: string;

  @Column({ type: 'enum', enum: CaseStatus, default: CaseStatus.ACTIVE })
  status: CaseStatus;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  lastSeenAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lastSeenLatitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lastSeenLongitude: number;

  @Column({ nullable: true })
  lastSeenAddressText: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 3.0 })
  radiusKm: number;

  @Column({ default: false })
  rewardEnabled: boolean;

  @Column({ nullable: true })
  rewardDescription: string;

  @Column({ nullable: true })
  contactPreference: string;

  @Column({ default: 0 })
  urgencyLevel: number;

  @Column({ default: false })
  notificationSent: boolean;

  @OneToMany(() => CaseTimelineEvent, (event) => event.lostCase, { cascade: true })
  timeline: CaseTimelineEvent[];

  @OneToMany(() => SightingReport, (sighting) => sighting.lostCase, { cascade: true })
  sightings: SightingReport[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  resolvedAt: Date;

  @Column({ nullable: true })
  expiresAt: Date;
}
