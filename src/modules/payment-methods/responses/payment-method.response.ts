// src/modules/payment-methods/responses/payment-method.response.ts

import { RecordStatus } from '../../../common/enums/record-status.enum';

export class PaymentMethodResponse {
  id!: string;
  code!: string;
  name!: string;
  status!: RecordStatus;
}
