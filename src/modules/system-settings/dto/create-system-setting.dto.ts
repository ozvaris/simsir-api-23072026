import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { RecordStatus } from '../../../common/enums/record-status.enum';
import { SystemSettingValueType } from '../enums/system-setting-value-type.enum';

export class CreateSystemSettingDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  key!: string;

  @IsString()
  @IsNotEmpty()
  value!: string;

  @IsEnum(SystemSettingValueType)
  valueType!: SystemSettingValueType;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  groupKey?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string | null;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsEnum(RecordStatus)
  status?: RecordStatus;
}
