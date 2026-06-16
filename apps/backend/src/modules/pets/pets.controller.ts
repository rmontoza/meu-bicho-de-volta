import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { PetsService } from './pets.service';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/pets')
export class PetsController {
  constructor(private petsService: PetsService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreatePetDto) {
    return this.petsService.create(user, dto);
  }

  @Get('mine')
  findMine(@CurrentUser() user: User) {
    return this.petsService.findMine(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.petsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @CurrentUser() user: User, @Body() dto: UpdatePetDto) {
    return this.petsService.update(id, user, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.petsService.remove(id, user);
  }

  @Post(':id/photos')
  addPhoto(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body('url') url: string,
    @Body('order') order?: number,
  ) {
    return this.petsService.addPhoto(id, user, url, order);
  }

  @Delete('photos/:photoId')
  removePhoto(@Param('photoId') photoId: string, @CurrentUser() user: User) {
    return this.petsService.removePhoto(photoId, user);
  }
}
