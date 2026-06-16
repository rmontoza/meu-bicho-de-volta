import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { CreateLostCaseDto } from './dto/create-lost-case.dto';
import { CreateSightingDto } from './dto/create-sighting.dto';
import { UpdateLostCaseDto } from './dto/update-lost-case.dto';
import { LostCasesService } from './lost-cases.service';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/lost-cases')
export class LostCasesController {
  constructor(private lostCasesService: LostCasesService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateLostCaseDto) {
    return this.lostCasesService.create(user, dto);
  }

  @Get()
  findAll(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radius') radius?: string,
  ) {
    return this.lostCasesService.findAll(
      lat ? parseFloat(lat) : undefined,
      lng ? parseFloat(lng) : undefined,
      radius ? parseFloat(radius) : 10,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lostCasesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateLostCaseDto,
  ) {
    return this.lostCasesService.update(id, user, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.lostCasesService.remove(id, user);
  }

  @Post(':id/sightings')
  addSighting(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: CreateSightingDto,
  ) {
    return this.lostCasesService.addSighting(id, user, dto);
  }
}
