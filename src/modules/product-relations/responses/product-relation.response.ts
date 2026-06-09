// src/modules/product-relations/responses/product-relation.response.ts

import { ProductRelationType } from '../enums/product-relation-type.enum';

export class ProductRelationResponse {
  id!: string;
  sourceProductId!: string;
  targetProductId!: string;
  relationType!: ProductRelationType;
}
