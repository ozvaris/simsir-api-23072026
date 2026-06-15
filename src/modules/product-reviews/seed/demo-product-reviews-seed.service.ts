// src/modules/product-reviews/seed/demo-product-reviews-seed.service.ts

import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { shouldRunSeed } from '../../../common/seed/seed-execution-policy';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';
import { ProductReview } from '../entities/product-review.entity';

export const DEMO_PRODUCT_REVIEW_SEEDS = [
  {
    productSlug: 'demo-wireless-headphones',
    userEmail: 'customer@example.com',
    ratingValue: '4.8',
    comment: 'Comfortable demo headphones with clear sound.',
  },
  {
    productSlug: 'demo-smart-watch',
    userEmail: 'customer@example.com',
    ratingValue: '4.5',
    comment: 'Useful demo watch for storefront review testing.',
  },
  {
    productSlug: 'demo-phone-case',
    userEmail: 'customer@example.com',
    ratingValue: '4.2',
    comment: 'Simple demo case with a clean product detail example.',
  },
] as const;

@Injectable()
export class DemoProductReviewsSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DemoProductReviewsSeedService.name);

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductReview)
    private readonly productReviewRepository: Repository<ProductReview>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (!shouldRunSeed(this.configService, 'demo')) {
      this.logger.log('Skipping demo product review seed.');
      return;
    }

    await this.seedProductReviews();
  }

  private async seedProductReviews(): Promise<void> {
    const updatedProductIds = new Set<string>();

    for (const seed of DEMO_PRODUCT_REVIEW_SEEDS) {
      const product = await this.productRepository.findOne({
        where: { slug: seed.productSlug },
      });

      if (!product) {
        this.logger.warn(
          `Skipping demo product review; product ${seed.productSlug} was not found.`,
        );
        continue;
      }

      const user = await this.userRepository.findOne({
        where: { email: seed.userEmail },
      });

      if (!user) {
        this.logger.warn(
          `Skipping demo product review for ${seed.productSlug}; user ${seed.userEmail} was not found.`,
        );
        continue;
      }

      const existingReview = await this.productReviewRepository.findOne({
        where: {
          productId: product.id,
          userId: user.id,
        },
      });

      if (existingReview) {
        continue;
      }

      await this.productReviewRepository.save(
        this.productReviewRepository.create({
          productId: product.id,
          userId: user.id,
          ratingValue: seed.ratingValue,
          comment: seed.comment,
        }),
      );

      updatedProductIds.add(product.id);
    }

    for (const productId of updatedProductIds) {
      await this.recalculateProductRating(productId);
    }
  }

  private async recalculateProductRating(productId: string): Promise<void> {
    const result = await this.productReviewRepository
      .createQueryBuilder('review')
      .select('AVG(review."ratingValue")', 'avg')
      .where('review."productId" = :productId', { productId })
      .getRawOne<{ avg: string | null }>();

    const averageRating = Number(result?.avg ?? 0).toFixed(1);

    await this.productRepository.update(productId, {
      rating: averageRating,
    });
  }
}
