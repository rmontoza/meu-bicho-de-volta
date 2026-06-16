import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { CaseType } from '../../../common/enums';

export class CreateLostCaseDto {
  @IsUUID()
  petId: string;

  @IsEnum(CaseType)
  caseType: CaseType;

  @IsString()
  @MaxLength(120)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsDateString()
  lastSeenAt: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  lastSeenLatitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lastSeenLongitude: number;

  @IsOptional()
  @IsString()
  lastSeenAddressText?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  radiusKm?: number;

  @IsOptional()
  @IsBoolean()
  rewardEnabled?: boolean;

  @IsOptional()
  @IsString()
  contactPreference?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  urgencyLevel?: number;
}
