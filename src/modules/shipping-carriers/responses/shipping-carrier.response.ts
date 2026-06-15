// src/modules/shipping-carriers/responses/shipping-carrier.response.ts

import { RecordStatus } from '../../../common/enums/record-status.enum';
import { ShippingCarrierServiceResponse } from './shipping-carrier-service.response';

export class ShippingCarrierResponse {
  id!: string;
  code!: string;
  name!: string;
  description!: string | null;
  logoUrl!: string | null;
  sortOrder!: number;
  status!: RecordStatus;
  services?: ShippingCarrierServiceResponse[];
}
