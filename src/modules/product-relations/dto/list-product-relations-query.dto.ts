// src/modules/product-relations/dto/list-product-relations-query.dto.ts

import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ProductRelationType } from '../enums/product-relation-type.enum';

export class ListProductRelationsQueryDto {
  @IsOptional()
  @IsEnum(ProductRelationType)
  relationType?: ProductRelationType;

  @IsOptional()
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
