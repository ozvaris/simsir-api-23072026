import { PaginationResponse } from '../../rbac/responses/pagination.response';

export class OrderListResponse<T> {
  items!: T[];
  pagination?: PaginationResponse;

  constructor(partial?: Partial<OrderListResponse<T>>) {
    Object.assign(this, partial);
  }
}
