// src/modules/product-media/responses/product-media.response.ts

export class ProductMediaResponse {
  id!: string;
  productId!: string;
  src!: string;
  alt!: string | null;
  sortOrder!: number;
}
