import { Product } from '../../modules/products/entities/product.entity';
import { ProductListItem } from '../types/product-list-item.type';

function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value);
}

function mapInventorySummary(product: Product): ProductListItem['inventory'] {
  const inventoryItem = product.inventoryItems?.[0] ?? null;

  if (!inventoryItem) {
    return {
      isTracked: false,
      onHandQuantity: null,
      reservedQuantity: null,
      availableQuantity: null,
    };
  }

  const onHandQuantity = inventoryItem.onHandQuantity;
  const reservedQuantity = inventoryItem.reservedQuantity;

  return {
    isTracked: true,
    onHandQuantity,
    reservedQuantity,
    availableQuantity: onHandQuantity - reservedQuantity,
  };
}

export function mapProductListItem(product: Product): ProductListItem {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    brandName: product.brandName,
    categoryId: product.categoryId,
    price: toNumber(product.price),
    discount: toNumber(product.discount),
    rating: toNumber(product.rating),
    imgUrl: product.imgUrl,
    shortDescription: product.shortDescription,
    longDescription: product.longDescription,
    status: product.status,
    inventory: mapInventorySummary(product),
  };
}
