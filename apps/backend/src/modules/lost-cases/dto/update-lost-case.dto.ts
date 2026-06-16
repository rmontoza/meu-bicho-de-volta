import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { CaseStatus } from '../../../common/enums';

export class UpdateLostCaseDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsEnum(CaseStatus)
  status?: CaseStatus;

  @IsOptional()
  @IsBoolean()
  rewardEnabled?: boolean;

  @IsOptional()
  @IsString()
  contactPreference?: string;
}
