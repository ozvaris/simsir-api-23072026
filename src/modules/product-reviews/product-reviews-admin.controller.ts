// src/modules/product-reviews/product-reviews-admin.controller.ts

import { Controller, Get, Param, Query } from '@nestjs/common';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ListReviewsQueryDto } from './dto/list-reviews-query.dto';
import { ProductReviewsService } from './product-reviews.service';

@Controller('admin/products')
export class ProductReviewsAdminController {
  constructor(private readonly productReviewsService: ProductReviewsService) {}

  @Get(':productId/reviews')
  @Permissions('catalog.product.read')
  listProductReviews(
    @Param('productId') productId: string,
    @Query() query: ListReviewsQueryDto,
  ) {
    return this.productReviewsService.listProductReviewsForAdmin(
      productId,
      query,
    );
  }

  @Get('reviews/:reviewId')
  @Permissions('catalog.product.read')
  getProductReview(@Param('reviewId') reviewId: string) {
    return this.productReviewsService.getProductReviewForAdmin(reviewId);
  }
}
