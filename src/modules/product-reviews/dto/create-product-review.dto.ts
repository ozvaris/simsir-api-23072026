// src/modules/product-reviews/dto/create-product-review.dto.ts

import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateProductReviewDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  ratingValue!: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  comment?: string | null;
}
