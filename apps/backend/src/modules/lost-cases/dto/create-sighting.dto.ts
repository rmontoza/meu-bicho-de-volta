import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { SightingCertainty } from '../../../common/enums';

export class CreateSightingDto {
  @IsDateString()
  seenAt: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsOptional()
  @IsEnum(SightingCertainty)
  certaintyLevel?: SightingCertainty;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}
