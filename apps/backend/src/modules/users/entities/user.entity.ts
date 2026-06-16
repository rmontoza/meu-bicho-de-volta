import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserRole, UserStatus } from '../../../common/enums';
import { UserDevice } from './user-device.entity';
import { UserLocation } from './user-location.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true, select: false })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING_EMAIL_VALIDATION })
  status: UserStatus;

  @Column({ nullable: true })
  profilePhotoUrl: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true })
  appleId: string;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ default: false })
  termsAccepted: boolean;

  @Column({ nullable: true })
  termsAcceptedAt: Date;

  @OneToMany(() => UserDevice, (device) => device.user)
  devices: UserDevice[];

  @OneToMany(() => UserLocation, (location) => location.user)
  locations: UserLocation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastLoginAt: Date;
}
