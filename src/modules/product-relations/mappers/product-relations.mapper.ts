// src/modules/product-relations/mappers/product-relations.mapper.ts

import { ProductRelation } from '../entities/product-relation.entity';
import { ProductRelationResponse } from '../responses/product-relation.response';

export function toProductRelationResponse(
  relation: ProductRelation,
): ProductRelationResponse {
  return {
    id: relation.id,
    sourceProductId: relation.sourceProductId,
    targetProductId: relation.targetProductId,
    relationType: relation.relationType,
  };
}

export const mapProductRelation = toProductRelationResponse;
