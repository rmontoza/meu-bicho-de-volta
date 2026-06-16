import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { DevicePlatform } from '../../../common/enums';

export class RegisterDeviceDto {
  @IsString()
  deviceId: string;

  @IsEnum(DevicePlatform)
  platform: DevicePlatform;

  @IsOptional()
  @IsString()
  pushToken?: string;

  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;
}
