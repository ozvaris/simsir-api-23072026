// src/modules/payment-methods/responses/payment-method-list.response.ts

import { PaginationResponse } from '../../rbac/responses/pagination.response';

export class PaymentMethodListResponse<T> {
  items!: T[];
  pagination?: PaginationResponse;

  constructor(partial?: Partial<PaymentMethodListResponse<T>>) {
    Object.assign(this, partial);
  }
}
