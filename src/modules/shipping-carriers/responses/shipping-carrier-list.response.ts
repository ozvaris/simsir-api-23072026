// src/modules/shipping-carriers/responses/shipping-carrier-list.response.ts

import { PaginationResponse } from '../../rbac/responses/pagination.response';

export class ShippingCarrierListResponse<T> {
  items!: T[];
  freeShippingThreshold?: number;
  pagination?: PaginationResponse;

  constructor(partial?: Partial<ShippingCarrierListResponse<T>>) {
    Object.assign(this, partial);
  }
}
