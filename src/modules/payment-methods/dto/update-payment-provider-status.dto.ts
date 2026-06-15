import { IsEnum } from 'class-validator';
import { RecordStatus } from '../../../common/enums/record-status.enum';

export class UpdatePaymentProviderStatusDto {
  @IsEnum(RecordStatus)
  status!: RecordStatus;
}
