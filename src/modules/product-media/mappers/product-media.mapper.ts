// src/modules/product-media/mappers/product-media.mapper.ts

import { ProductMedia } from '../entities/product-media.entity';
import { ProductMediaResponse } from '../responses/product-media.response';

export function toProductMediaResponse(
  media: ProductMedia,
): ProductMediaResponse {
  return {
    id: media.id,
    productId: media.productId,
    src: media.src,
    alt: media.alt,
    sortOrder: media.sortOrder,
  };
}

export const mapProductMedia = toProductMediaResponse;
