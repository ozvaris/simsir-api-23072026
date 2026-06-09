// src/modules/product-reviews/product-reviews.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from '../products/products.module';
import { ProductReview } from './entities/product-review.entity';
import { ProductReviewsAdminController } from './product-reviews-admin.controller';
import { ProductReviewsController } from './product-reviews.controller';
import { ProductReviewsService } from './product-reviews.service';
import { ProductReviewsRepository } from './repositories/product-reviews.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProductReview]), ProductsModule],
  controllers: [ProductReviewsController, ProductReviewsAdminController],
  providers: [ProductReviewsService, ProductReviewsRepository],
  exports: [ProductReviewsService, ProductReviewsRepository, TypeOrmModule],
})
export class ProductReviewsModule {}
