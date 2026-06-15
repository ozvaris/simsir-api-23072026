import { IsEnum } from 'class-validator';
import { RecordStatus } from '../../../common/enums/record-status.enum';

export class UpdateShippingCarrierServicePaymentCapabilityStatusDto {
  @IsEnum(RecordStatus)
  status!: RecordStatus;
}
