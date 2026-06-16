import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../../common/enums';
import { User } from '../users/entities/user.entity';
import { PetPhoto } from './entities/pet-photo.entity';
import { Pet } from './entities/pet.entity';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(Pet) private petsRepo: Repository<Pet>,
    @InjectRepository(PetPhoto) private photosRepo: Repository<PetPhoto>,
  ) {}

  async create(user: User, dto: CreatePetDto) {
    const pet = this.petsRepo.create({ ...dto, ownerId: user.id });
    return this.petsRepo.save(pet);
  }

  async findMine(userId: string) {
    return this.petsRepo.find({
      where: { ownerId: userId },
      relations: { photos: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const pet = await this.petsRepo.findOne({
      where: { id },
      relations: { photos: true },
    });
    if (!pet) throw new NotFoundException('Pet não encontrado.');
    return pet;
  }

  async update(id: string, user: User, dto: UpdatePetDto) {
    const pet = await this.findOne(id);
    this.assertOwnerOrAdmin(pet, user);
    await this.petsRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string, user: User) {
    const pet = await this.findOne(id);
    this.assertOwnerOrAdmin(pet, user);
    await this.petsRepo.remove(pet);
    return { message: 'Pet removido.' };
  }

  async addPhoto(petId: string, user: User, url: string, order = 0) {
    const pet = await this.findOne(petId);
    this.assertOwnerOrAdmin(pet, user);
    const photo = this.photosRepo.create({ petId, url, order });
    return this.photosRepo.save(photo);
  }

  async removePhoto(photoId: string, user: User) {
    const photo = await this.photosRepo.findOne({ where: { id: photoId }, relations: { pet: true } });
    if (!photo) throw new NotFoundException('Foto não encontrada.');
    this.assertOwnerOrAdmin(photo.pet, user);
    await this.photosRepo.remove(photo);
    return { message: 'Foto removida.' };
  }

  private assertOwnerOrAdmin(pet: Pet, user: User) {
    if (pet.ownerId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Sem permissão.');
    }
  }
}
