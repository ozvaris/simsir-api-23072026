import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { RecordStatus } from '../../../common/enums/record-status.enum';

export class ListSystemSettingsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  groupKey?: string;

  @IsOptional()
  @IsEnum(RecordStatus)
  status?: RecordStatus;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  search?: string;
}
