// src/modules/product-media/responses/product-media-list.response.ts

import { ProductMediaResponse } from './product-media.response';

export class ProductMediaListResponse {
  items!: ProductMediaResponse[];
  pagination!: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}
