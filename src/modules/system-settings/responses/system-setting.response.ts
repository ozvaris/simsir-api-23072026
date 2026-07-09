import { RecordStatus } from '../../../common/enums/record-status.enum';
import { SystemSettingValueType } from '../enums/system-setting-value-type.enum';

export class SystemSettingResponse {
  id!: string;
  key!: string;
  value!: string;
  parsedValue!: boolean | number | string | Record<string, unknown> | null;
  valueType!: SystemSettingValueType;
  groupKey!: string | null;
  description!: string | null;
  isPublic!: boolean;
  isSystem!: boolean;
  status!: RecordStatus;
  createdById!: string | null;
  createdByName!: string | null;
  createdAt!: Date;
  updatedById!: string | null;
  updatedByName!: string | null;
  updatedAt!: Date;
}
