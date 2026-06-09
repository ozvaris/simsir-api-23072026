// src/modules/product-reviews/product-reviews.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CreateProductReviewDto } from './dto/create-product-review.dto';
import { ListReviewsQueryDto } from './dto/list-reviews-query.dto';
import { UpdateProductReviewDto } from './dto/update-product-review.dto';
import { ProductReviewsService } from './product-reviews.service';

@Controller('products')
export class ProductReviewsController {
  constructor(private readonly productReviewsService: ProductReviewsService) {}

  @Public()
  @Get(':productId/reviews')
  listProductReviews(
    @Param('productId') productId: string,
    @Query() query: ListReviewsQueryDto,
  ) {
    return this.productReviewsService.listProductReviews(productId, query);
  }

  @Post(':productId/reviews')
  createProductReview(
    @CurrentUser('userId') userId: string,
    @Param('productId') productId: string,
    @Body() dto: CreateProductReviewDto,
  ) {
    return this.productReviewsService.createProductReview(
      userId,
      productId,
      dto,
    );
  }

  @Patch(':productId/reviews/:reviewId')
  updateMyProductReview(
    @CurrentUser('userId') userId: string,
    @Param('productId') productId: string,
    @Param('reviewId') reviewId: string,
    @Body() dto: UpdateProductReviewDto,
  ) {
    return this.productReviewsService.updateMyProductReview(
      userId,
      productId,
      reviewId,
      dto,
    );
  }

  @Delete(':productId/reviews/:reviewId')
  deleteMyProductReview(
    @CurrentUser('userId') userId: string,
    @Param('productId') productId: string,
    @Param('reviewId') reviewId: string,
  ) {
    return this.productReviewsService.deleteMyProductReview(
      userId,
      productId,
      reviewId,
    );
  }
}
