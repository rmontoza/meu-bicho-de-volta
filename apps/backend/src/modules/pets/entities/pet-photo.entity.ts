import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Pet } from './pet.entity';

@Entity('pet_photos')
export class PetPhoto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pet, (pet) => pet.photos, { onDelete: 'CASCADE' })
  pet: Pet;

  @Column()
  petId: string;

  @Column()
  url: string;

  @Column({ default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;
}
