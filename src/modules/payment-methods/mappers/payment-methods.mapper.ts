// src/modules/payment-methods/mappers/payment-methods.mapper.ts

import { PaymentMethod } from '../entities/payment-method.entity';
import { PaymentMethodResponse } from '../responses/payment-method.response';

export function toPaymentMethodResponse(
  paymentMethod: PaymentMethod,
): PaymentMethodResponse {
  return {
    id: paymentMethod.id,
    code: paymentMethod.code,
    name: paymentMethod.name,
    status: paymentMethod.status,
  };
}
