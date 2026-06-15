// src/modules/products/mappers/products.mapper.ts

import { mapProductMedia } from '../../product-media/mappers/product-media.mapper';
import { ProductRelation } from '../../product-relations/entities/product-relation.entity';
import { ProductRelationType } from '../../product-relations/enums/product-relation-type.enum';
import { mapProductListItem } from '../../../common/mappers/product-list-item.mapper';
import { Product } from '../entities/product.entity';

export { mapProductListItem };

function mapRelationProduct(relation: ProductRelation) {
  return {
    id: relation.targetProduct.id,
    slug: relation.targetProduct.slug,
    title: relation.targetProduct.title,
  };
}

export function mapProductDetail(product: Product) {
  const sourceRelations = product.sourceRelations ?? [];

  return {
    ...mapProductListItem(product),

    media: (product.media ?? [])
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(mapProductMedia),

    relations: {
      frequentlyBoughtTogether: sourceRelations
        .filter(
          (relation) =>
            relation.relationType ===
              ProductRelationType.FREQUENTLY_BOUGHT_TOGETHER &&
            relation.targetProduct,
        )
        .map(mapRelationProduct),

      relatedProducts: sourceRelations
        .filter(
          (relation) =>
            relation.relationType === ProductRelationType.RELATED_PRODUCT &&
            relation.targetProduct,
        )
        .map(mapRelationProduct),
    },
  };
}
