import { IsEnum } from 'class-validator';
import { RecordStatus } from '../../../common/enums/record-status.enum';

export class UpdateShippingCarrierServiceStatusDto {
  @IsEnum(RecordStatus)
  status!: RecordStatus;
}
