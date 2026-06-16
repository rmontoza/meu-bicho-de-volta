import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { AnimalSize, AnimalType } from '../../../common/enums';
import { User } from '../../users/entities/user.entity';
import { PetPhoto } from './pet-photo.entity';

@Entity('pets')
export class Pet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  owner: User;

  @Column()
  ownerId: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: AnimalType })
  type: AnimalType;

  @Column({ nullable: true })
  breed: string;

  @Column({ type: 'enum', enum: AnimalSize, nullable: true })
  size: AnimalSize;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  sex: string;

  @Column({ nullable: true })
  age: number;

  @Column({ default: false })
  isNeutered: boolean;

  @Column({ default: false })
  hasMicrochip: boolean;

  @Column({ nullable: true })
  medicalNotes: string;

  @Column({ nullable: true })
  temperament: string;

  @Column({ nullable: true })
  photoCoverUrl: string;

  @OneToMany(() => PetPhoto, (photo) => photo.pet, { cascade: true })
  photos: PetPhoto[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
