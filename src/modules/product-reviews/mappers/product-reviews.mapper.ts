// src/modules/product-reviews/mappers/product-reviews.mapper.ts

import { ProductReview } from '../entities/product-review.entity';
import { ProductReviewResponse } from '../responses/product-review.response';

function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value);
}

export function toProductReviewResponse(
  review: ProductReview,
): ProductReviewResponse {
  return {
    id: review.id,
    productId: review.productId,
    userId: review.userId,
    ratingValue: toNumber(review.ratingValue),
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
    author: review.user
      ? {
          id: review.user.id,
          name: review.user.name,
          surname: review.user.surname,
        }
      : undefined,
  };
}

export const mapProductReview = toProductReviewResponse;

export function mapCreatedProductReview(review: ProductReview) {
  return {
    id: review.id,
    productId: review.productId,
    userId: review.userId,
    ratingValue: toNumber(review.ratingValue),
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
  };
}
