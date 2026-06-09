// src/modules/product-relations/responses/product-relation-list.response.ts

import { ProductRelationResponse } from './product-relation.response';

export class ProductRelationListResponse {
  items!: ProductRelationResponse[];
  pagination!: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}
