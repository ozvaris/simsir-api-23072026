// src/modules/shipping-carriers/mappers/shipping-carriers.mapper.ts

import { ShippingCarrier } from '../entities/shipping-carrier.entity';
import { ShippingCarrierResponse } from '../responses/shipping-carrier.response';

function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value);
}

export function toShippingCarrierResponse(
  carrier: ShippingCarrier,
): ShippingCarrierResponse {
  return {
    id: carrier.id,
    code: carrier.code,
    name: carrier.name,
    fee: toNumber(carrier.fee),
    status: carrier.status,
  };
}
