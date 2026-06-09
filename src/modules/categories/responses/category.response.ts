// src/modules/categories/responses/category.response.ts

export class CategoryResponse {
  id!: string;
  parentId!: string | null;
  slug!: string;
  name!: string;
  imgUrl!: string | null;
  sortOrder!: number;
  status!: string;

  constructor(partial?: Partial<CategoryResponse>) {
    Object.assign(this, partial);
  }
}
