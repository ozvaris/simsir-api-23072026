import { PaginationResponse } from './pagination.response';

export class ListResponse<T> {
  items!: T[];
  pagination!: PaginationResponse;

  constructor(partial?: Partial<ListResponse<T>>) {
    Object.assign(this, partial);
  }
}
