// src/modules/product-reviews/product-reviews.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from '../products/repositories/products.repository';
import { CreateProductReviewDto } from './dto/create-product-review.dto';
import { ListReviewsQueryDto } from './dto/list-reviews-query.dto';
import { UpdateProductReviewDto } from './dto/update-product-review.dto';
import {
  mapCreatedProductReview,
  toProductReviewResponse,
} from './mappers/product-reviews.mapper';
import { ProductReviewsRepository } from './repositories/product-reviews.repository';

@Injectable()
export class ProductReviewsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly productReviewsRepository: ProductReviewsRepository,
  ) {}

  async listProductReviews(productId: string, query: ListReviewsQueryDto) {
    const product =
      await this.productsRepository.findPublicProductById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const [reviews] = await this.productReviewsRepository.findProductReviews(
      productId,
      query,
    );

    return {
      items: reviews.map(toProductReviewResponse),
    };
  }

  async listProductReviewsForAdmin(
    productId: string,
    query: ListReviewsQueryDto,
  ) {
    const product = await this.productsRepository.findProductById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [reviews, totalItems] =
      await this.productReviewsRepository.findReviewsByProductId(
        productId,
        query,
      );

    return {
      items: reviews.map(toProductReviewResponse),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async getProductReviewForAdmin(reviewId: string) {
    const review = await this.productReviewsRepository.findReviewById(reviewId);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return toProductReviewResponse(review);
  }

  async createProductReview(
    userId: string,
    productId: string,
    dto: CreateProductReviewDto,
  ) {
    const product =
      await this.productsRepository.findPublicProductById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const review = this.productReviewsRepository.createReview({
      productId,
      userId,
      ratingValue: dto.ratingValue.toFixed(1),
      comment: dto.comment?.trim() || null,
    });

    const savedReview = await this.productReviewsRepository.saveReview(review);

    await this.recalculateProductRating(productId);

    return mapCreatedProductReview(savedReview);
  }

  async updateMyProductReview(
    userId: string,
    productId: string,
    reviewId: string,
    dto: UpdateProductReviewDto,
  ) {
    const review =
      await this.productReviewsRepository.findReviewByIdProductIdAndUserId(
        reviewId,
        productId,
        userId,
      );

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (dto.ratingValue !== undefined) {
      review.ratingValue = dto.ratingValue.toFixed(1);
    }

    if (dto.comment !== undefined) {
      review.comment = dto.comment?.trim() || null;
    }

    const savedReview = await this.productReviewsRepository.saveReview(review);

    await this.recalculateProductRating(productId);

    return mapCreatedProductReview(savedReview);
  }

  async deleteMyProductReview(
    userId: string,
    productId: string,
    reviewId: string,
  ): Promise<{ success: true }> {
    const review =
      await this.productReviewsRepository.findReviewByIdProductIdAndUserId(
        reviewId,
        productId,
        userId,
      );

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    await this.productReviewsRepository.removeReview(review);

    await this.recalculateProductRating(productId);

    return { success: true };
  }

  private async recalculateProductRating(productId: string): Promise<void> {
    const product = await this.productsRepository.findProductById(productId);

    if (!product) {
      return;
    }

    const averageRating =
      await this.productReviewsRepository.getAverageRating(productId);

    product.rating = averageRating.toFixed(1);

    await this.productsRepository.saveProduct(product);
  }
}
