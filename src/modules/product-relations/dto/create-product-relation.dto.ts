// src/modules/product-relations/dto/create-product-relation.dto.ts

import { IsEnum, IsUUID } from 'class-validator';
import { ProductRelationType } from '../enums/product-relation-type.enum';

export class CreateProductRelationDto {
  @IsUUID()
  targetProductId!: string;

  @IsEnum(ProductRelationType)
  relationType!: ProductRelationType;
}
