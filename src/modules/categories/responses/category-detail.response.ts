// src/modules/categories/responses/category-detail.response.ts

import { CategoryResponse } from './category.response';

export class CategoryDetailResponse extends CategoryResponse {
  parent?: CategoryResponse | null;
  children!: CategoryResponse[];

  constructor(partial?: Partial<CategoryDetailResponse>) {
    super(partial);
    Object.assign(this, partial);
  }
}
