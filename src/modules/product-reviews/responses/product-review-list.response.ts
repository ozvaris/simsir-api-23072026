// src/modules/product-reviews/responses/product-review-list.response.ts

import { ProductReviewResponse } from './product-review.response';

export class ProductReviewListResponse {
  items!: ProductReviewResponse[];
  pagination!: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}
