// src/modules/shipping-carriers/responses/shipping-carrier.response.ts

import { RecordStatus } from '../../../common/enums/record-status.enum';

export class ShippingCarrierResponse {
  id!: string;
  code!: string;
  name!: string;
  fee!: number;
  status!: RecordStatus;
}
