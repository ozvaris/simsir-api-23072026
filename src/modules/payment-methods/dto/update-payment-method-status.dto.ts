// src/modules/payment-methods/dto/update-payment-method-status.dto.ts

import { IsEnum } from 'class-validator';
import { RecordStatus } from '../../../common/enums/record-status.enum';

export class UpdatePaymentMethodStatusDto {
  @IsEnum(RecordStatus)
  status!: RecordStatus;
}
