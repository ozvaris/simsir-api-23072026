// src/modules/product-reviews/product-reviews.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { ProductsModule } from '../products/products.module';
import { User } from '../users/entities/user.entity';
import { ProductReview } from './entities/product-review.entity';
import { ProductReviewsAdminController } from './product-reviews-admin.controller';
import { ProductReviewsController } from './product-reviews.controller';
import { ProductReviewsService } from './product-reviews.service';
import { ProductReviewsRepository } from './repositories/product-reviews.repository';
import { DemoProductReviewsSeedService } from './seed/demo-product-reviews-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductReview, User]), ProductsModule],
  controllers: [ProductReviewsController, ProductReviewsAdminController],
  providers: [
    ProductReviewsService,
    ProductReviewsRepository,
    DemoProductReviewsSeedService,
  ],
  exports: [ProductReviewsService, ProductReviewsRepository, TypeOrmModule],
})
export class ProductReviewsModule {}
