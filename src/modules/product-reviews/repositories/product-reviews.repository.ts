// src/modules/product-reviews/repositories/product-reviews.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListReviewsQueryDto } from '../dto/list-reviews-query.dto';
import { ProductReview } from '../entities/product-review.entity';

@Injectable()
export class ProductReviewsRepository {
  constructor(
    @InjectRepository(ProductReview)
    private readonly productReviewRepository: Repository<ProductReview>,
  ) {}

  async findProductReviews(
    productId: string,
    query: ListReviewsQueryDto,
  ): Promise<[ProductReview[], number]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    return this.productReviewRepository.findAndCount({
      where: { productId },
      relations: {
        user: true,
      },
      order: {
        createdAt: 'DESC',
      },
      skip,
      take: limit,
    });
  }

  async findReviewsByProductId(
    productId: string,
    query: ListReviewsQueryDto,
  ): Promise<[ProductReview[], number]> {
    return this.findProductReviews(productId, query);
  }

  createReview(data: Partial<ProductReview>): ProductReview {
    return this.productReviewRepository.create(data);
  }

  saveReview(review: ProductReview): Promise<ProductReview> {
    return this.productReviewRepository.save(review);
  }

  findReviewByIdProductIdAndUserId(
    reviewId: string,
    productId: string,
    userId: string,
  ): Promise<ProductReview | null> {
    return this.productReviewRepository.findOne({
      where: {
        id: reviewId,
        productId,
        userId,
      },
    });
  }

  findOwnedReview(
    reviewId: string,
    productId: string,
    userId: string,
  ): Promise<ProductReview | null> {
    return this.findReviewByIdProductIdAndUserId(reviewId, productId, userId);
  }

  findReviewById(reviewId: string): Promise<ProductReview | null> {
    return this.productReviewRepository.findOne({
      where: { id: reviewId },
      relations: {
        user: true,
      },
    });
  }

  async removeReview(review: ProductReview): Promise<void> {
    await this.productReviewRepository.remove(review);
  }

  async getAverageRating(productId: string): Promise<number> {
    const result = await this.productReviewRepository
      .createQueryBuilder('review')
      .select('AVG(review."ratingValue")', 'avg')
      .where('review."productId" = :productId', { productId })
      .getRawOne<{ avg: string | null }>();

    return Number(result?.avg ?? 0);
  }
}
