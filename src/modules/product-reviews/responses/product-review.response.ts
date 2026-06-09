// src/modules/product-reviews/responses/product-review.response.ts

export class ProductReviewAuthorResponse {
  id!: string;
  name!: string;
  surname!: string;
}

export class ProductReviewResponse {
  id!: string;
  productId!: string;
  userId!: string;
  ratingValue!: number;
  comment!: string | null;
  createdAt!: string;
  author?: ProductReviewAuthorResponse;
}
