import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDevice } from './entities/user-device.entity';
import { UserLocation } from './entities/user-location.entity';
import { User } from './entities/user.entity';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(UserDevice) private devicesRepo: Repository<UserDevice>,
    @InjectRepository(UserLocation) private locationsRepo: Repository<UserLocation>,
  ) {}

  async findById(id: string) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findById(id);
    await this.usersRepo.update(id, dto);
    return this.usersRepo.findOne({ where: { id } });
  }

  async updateLocation(userId: string, dto: UpdateLocationDto) {
    await this.findById(userId);

    const existing = await this.locationsRepo.findOne({ where: { userId } });

    if (existing) {
      await this.locationsRepo.update(existing.id, {
        latitude: dto.latitude,
        longitude: dto.longitude,
        city: dto.city,
        state: dto.state,
        source: dto.source,
      });
      return this.locationsRepo.findOne({ where: { id: existing.id } });
    }

    const location = this.locationsRepo.create({ userId, ...dto });
    return this.locationsRepo.save(location);
  }

  async registerDevice(userId: string, dto: RegisterDeviceDto) {
    await this.findById(userId);

    const existing = await this.devicesRepo.findOne({
      where: { userId, deviceId: dto.deviceId },
    });

    if (existing) {
      await this.devicesRepo.update(existing.id, {
        pushToken: dto.pushToken,
        platform: dto.platform,
        pushEnabled: dto.pushEnabled ?? true,
      });
      return this.devicesRepo.findOne({ where: { id: existing.id } });
    }

    const device = this.devicesRepo.create({
      userId,
      deviceId: dto.deviceId,
      platform: dto.platform,
      pushToken: dto.pushToken,
      pushEnabled: dto.pushEnabled ?? true,
    });
    return this.devicesRepo.save(device);
  }
}
