// src/modules/categories/categories.service.ts

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { mapProductListItem } from '../../common/mappers/product-list-item.mapper';
import { RecordStatus } from '../../common/enums/record-status.enum';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ListCategoriesQueryDto } from './dto/list-categories-query.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { CategoriesRepository } from './repositories/categories.repository';
import { CategoryProductsQueryDto } from './dto/category-products-query.dto';
import { Product } from '../products/entities/product.entity';
import { CategoryResponse } from './responses/category.response';
import { CategoryTreeResponse } from './responses/category-tree.response';
import { CategoryProductResponse } from './responses/category-product.response';
import { CategoryProductsResponse } from './responses/category-products.response';
import { CategoryDetailResponse } from './responses/category-detail.response';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async listCategories(): Promise<{ items: CategoryResponse[] }> {
    const categories = await this.categoriesRepository.findPublicList();

    return {
      items: categories.map((category) => this.toCategoryResponse(category)),
    };
  }

  async listCategoriesForAdmin(query: ListCategoriesQueryDto): Promise<{
    items: CategoryResponse[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [categories, totalItems] =
      await this.categoriesRepository.findAdminList(query);

    return {
      items: categories.map((category) => this.toCategoryResponse(category)),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async getCategoryForAdmin(categoryId: string): Promise<CategoryResponse> {
    const category = await this.categoriesRepository.findById(categoryId);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.toCategoryResponse(category);
  }

  async listCategoryTree(): Promise<{ items: CategoryTreeResponse[] }> {
    const categories = await this.categoriesRepository.findRootCategories();

    return {
      items: categories.map((category) =>
        this.toCategoryTreeResponse(category),
      ),
    };
  }

  async createCategory(dto: CreateCategoryDto): Promise<CategoryResponse> {
    const slug = this.normalizeSlug(dto.slug);

    const existingCategory = await this.categoriesRepository.findBySlug(slug);

    if (existingCategory) {
      throw new ConflictException('Category slug already exists');
    }

    if (dto.parentId) {
      const parentCategory = await this.categoriesRepository.findById(
        dto.parentId,
      );

      if (!parentCategory) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const category = this.categoriesRepository.create({
      parentId: dto.parentId ?? null,
      slug,
      name: dto.name.trim(),
      imgUrl: dto.imgUrl?.trim() || null,
      sortOrder: dto.sortOrder ?? 0,
      status: dto.status ?? RecordStatus.ACTIVE,
    });

    const savedCategory = await this.categoriesRepository.save(category);

    return this.toCategoryResponse(savedCategory);
  }

  async updateCategory(
    categoryId: string,
    dto: UpdateCategoryDto,
  ): Promise<CategoryResponse> {
    const category = await this.categoriesRepository.findById(categoryId);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (dto.slug !== undefined) {
      const slug = this.normalizeSlug(dto.slug);

      const existingCategory =
        await this.categoriesRepository.findAnotherBySlug(categoryId, slug);

      if (existingCategory) {
        throw new ConflictException('Category slug already exists');
      }

      category.slug = slug;
    }

    if (dto.name !== undefined) {
      category.name = dto.name.trim();
    }

    if (dto.imgUrl !== undefined) {
      category.imgUrl = dto.imgUrl?.trim() || null;
    }

    if (dto.parentId !== undefined) {
      if (dto.parentId === category.id) {
        throw new ConflictException('Category cannot be parent of itself');
      }

      if (dto.parentId) {
        const parentCategory = await this.categoriesRepository.findById(
          dto.parentId,
        );

        if (!parentCategory) {
          throw new NotFoundException('Parent category not found');
        }
      }

      category.parentId = dto.parentId;
    }

    if (dto.sortOrder !== undefined) {
      category.sortOrder = dto.sortOrder;
    }

    if (dto.status !== undefined) {
      category.status = dto.status;
    }

    const savedCategory = await this.categoriesRepository.save(category);

    return this.toCategoryResponse(savedCategory);
  }

  async deleteCategory(categoryId: string): Promise<{ success: true }> {
    const category = await this.categoriesRepository.findById(categoryId);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const childCategoryCount =
      await this.categoriesRepository.countChildren(categoryId);

    if (childCategoryCount > 0) {
      throw new ConflictException(
        'Category cannot be deleted because it has child categories',
      );
    }

    const productCount =
      await this.categoriesRepository.countProducts(categoryId);

    if (productCount > 0) {
      throw new ConflictException(
        'Category cannot be deleted because it has products',
      );
    }

    try {
      await this.categoriesRepository.remove(category);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new ConflictException(
          'Category cannot be deleted because it has related records',
        );
      }

      throw error;
    }

    return { success: true };
  }

  private normalizeSlug(slug: string): string {
    return slug.trim().toLowerCase();
  }

  private toCategoryResponse(category: Category): CategoryResponse {
    return new CategoryResponse({
      id: category.id,
      parentId: category.parentId,
      slug: category.slug,
      name: category.name,
      imgUrl: category.imgUrl,
      sortOrder: category.sortOrder,
      status: category.status,
    });
  }

  private toCategoryTreeResponse(category: Category): CategoryTreeResponse {
    return new CategoryTreeResponse({
      ...this.toCategoryResponse(category),
      children: (category.children ?? [])
        .filter((child) => child.status === RecordStatus.ACTIVE)
        .map((child) => this.toCategoryResponse(child)),
    });
  }

  async getCategoryDetail(slug: string): Promise<CategoryDetailResponse> {
    const category =
      await this.categoriesRepository.findPublicBySlugWithParentAndChildren(
        slug,
      );

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.toCategoryDetailResponse(category);
  }

  private toCategoryDetailResponse(category: Category): CategoryDetailResponse {
    return new CategoryDetailResponse({
      ...this.toCategoryResponse(category),
      parent:
        category.parent?.status === RecordStatus.ACTIVE
          ? this.toCategoryResponse(category.parent)
          : null,
      children: (category.children ?? [])
        .filter((child) => child.status === RecordStatus.ACTIVE)
        .map((child) => this.toCategoryResponse(child)),
    });
  }

  async listCategoryProducts(
    slug: string,
    query: CategoryProductsQueryDto,
  ): Promise<CategoryProductsResponse> {
    const category = await this.categoriesRepository.findPublicBySlugWithProducts(
      slug,
      {
        includeInventorySummary: true,
      },
    );

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const products = (category.products ?? []).filter(
      (product) => product.status === RecordStatus.ACTIVE,
    );

    const sortedProducts = [...products].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    const start = (page - 1) * limit;
    const pagedProducts = sortedProducts.slice(start, start + limit);

    return new CategoryProductsResponse({
      category: this.toCategoryResponse(category),
      items: pagedProducts.map((product) =>
        this.toCategoryProductResponse(product),
      ),
      pagination: {
        page,
        limit,
        totalItems: products.length,
        totalPages: Math.ceil(products.length / limit),
      },
    });
  }

  private toCategoryProductResponse(product: Product): CategoryProductResponse {
    return new CategoryProductResponse({
      ...mapProductListItem(product),
    });
  }
}
