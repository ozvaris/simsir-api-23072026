// src/modules/categories/responses/category-tree.response.ts

import { CategoryResponse } from './category.response';

export class CategoryTreeResponse extends CategoryResponse {
  children!: CategoryResponse[];

  constructor(partial?: Partial<CategoryTreeResponse>) {
    super(partial);
    Object.assign(this, partial);
  }
}
