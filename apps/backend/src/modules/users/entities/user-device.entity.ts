import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { DevicePlatform } from '../../../common/enums';
import { User } from './user.entity';

@Entity('user_devices')
export class UserDevice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.devices, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;

  @Column()
  deviceId: string;

  @Column({ type: 'enum', enum: DevicePlatform })
  platform: DevicePlatform;

  @Column({ nullable: true })
  pushToken: string;

  @Column({ default: true })
  pushEnabled: boolean;

  @Column({ nullable: true })
  lastSeenAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
