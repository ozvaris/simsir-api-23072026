export class PaginationResponse {
  page!: number;
  limit!: number;
  totalItems!: number;
  totalPages!: number;

  constructor(partial?: Partial<PaginationResponse>) {
    Object.assign(this, partial);
  }
}
