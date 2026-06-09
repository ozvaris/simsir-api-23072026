// src/modules/shipping-carriers/dto/update-shipping-carrier-status.dto.ts

import { IsEnum } from 'class-validator';
import { RecordStatus } from '../../../common/enums/record-status.enum';

export class UpdateShippingCarrierStatusDto {
  @IsEnum(RecordStatus)
  status!: RecordStatus;
}
