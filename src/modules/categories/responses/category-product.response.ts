// src/modules/categories/responses/category-product.response.ts

export class CategoryProductResponse {
  id!: string;
  slug!: string;
  title!: string;
  brandName!: string | null;
  categoryId!: string;
  price!: number;
  discount!: number;
  rating!: number;
  imgUrl!: string | null;
  shortDescription!: string | null;
  longDescription!: string | null;
  status!: string;

  constructor(partial?: Partial<CategoryProductResponse>) {
    Object.assign(this, partial);
  }
}
