// src/modules/product-reviews/dto/update-product-review.dto.ts

import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateProductReviewDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  ratingValue?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  comment?: string | null;
}
