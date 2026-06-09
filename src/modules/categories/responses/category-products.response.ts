// src/modules/categories/responses/category-products.response.ts

import { CategoryProductResponse } from './category-product.response';
import { CategoryResponse } from './category.response';

export class CategoryProductsResponse {
  category!: CategoryResponse;
  items!: CategoryProductResponse[];
  pagination!: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };

  constructor(partial?: Partial<CategoryProductsResponse>) {
    Object.assign(this, partial);
  }
}
