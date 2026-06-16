import { IsEnum, IsUUID } from 'class-validator';
import { CaseType } from '../../../common/enums';

export class CreateConversationDto {
  @IsUUID()
  caseId: string;

  @IsEnum(CaseType)
  caseType: CaseType;

  @IsUUID()
  ownerUserId: string;
}
