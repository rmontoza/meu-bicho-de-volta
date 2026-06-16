import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from './entities/user.entity';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: User) {
    return this.usersService.findById(user.id);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.id, dto);
  }

  @Post('me/location')
  updateLocation(@CurrentUser() user: User, @Body() dto: UpdateLocationDto) {
    return this.usersService.updateLocation(user.id, dto);
  }

  @Post('me/devices')
  registerDevice(@CurrentUser() user: User, @Body() dto: RegisterDeviceDto) {
    return this.usersService.registerDevice(user.id, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
