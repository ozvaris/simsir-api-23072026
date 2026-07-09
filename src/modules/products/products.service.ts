// src/modules/products/products.service.ts

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { mapProductListItem } from '../../common/mappers/product-list-item.mapper';
import { RecordStatus } from '../../common/enums/record-status.enum';
import { CreateProductDto } from './dto/create-product.dto';
import { ListAdminProductsQueryDto } from './dto/list-admin-products-query.dto';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { mapProductDetail } from './mappers/products.mapper';
import { ProductsRepository } from './repositories/products.repository';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async listProducts(query: ListProductsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [products, totalItems] =
      await this.productsRepository.findProducts(query, {
        includeInventorySummary: true,
      });

    return {
      items: products.map(mapProductListItem),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async listProductsForAdmin(query: ListAdminProductsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [products, totalItems] =
      await this.productsRepository.findProductsForAdmin(query, {
        includeInventorySummary: true,
      });

    return {
      items: products.map(mapProductListItem),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async getProductDetail(slug: string) {
    const product = await this.productsRepository.findProductBySlug(slug, {
      includeInventorySummary: true,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return mapProductDetail(product);
  }

  async getProductForAdmin(productId: string) {
    const product = await this.productsRepository.findProductById(productId, {
      includeInventorySummary: true,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return mapProductListItem(product);
  }

  async createProduct(dto: CreateProductDto) {
    const slug = this.normalizeSlug(dto.slug);

    const existingProduct =
      await this.productsRepository.findProductBySlugPlain(slug);

    if (existingProduct) {
      throw new ConflictException('Product slug already exists');
    }

    const category = await this.productsRepository.findCategoryById(
      dto.categoryId,
    );

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const product = this.productsRepository.createProduct({
      slug,
      title: dto.title.trim(),
      brandName: dto.brandName?.trim() || null,
      categoryId: dto.categoryId,
      price: dto.price.toFixed(2),
      discount: (dto.discount ?? 0).toFixed(2),
      tax: (dto.tax ?? 0).toFixed(2),
      rating: (dto.rating ?? 0).toFixed(1),
      imgUrl: dto.imgUrl?.trim() || null,
      shortDescription: dto.shortDescription?.trim() || null,
      longDescription: dto.longDescription?.trim() || null,
      isTrackedInventory: dto.isTrackedInventory ?? false,
      status: dto.status ?? RecordStatus.ACTIVE,
    });

    const savedProduct = await this.productsRepository.saveProduct(product);

    return this.getProductForAdmin(savedProduct.id);
  }

  async updateProduct(productId: string, dto: UpdateProductDto) {
    const product = await this.productsRepository.findProductById(productId, {
      includeInventorySummary: true,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (dto.slug !== undefined) {
      const slug = this.normalizeSlug(dto.slug);

      const existingProduct =
        await this.productsRepository.findAnotherProductBySlug(productId, slug);

      if (existingProduct) {
        throw new ConflictException('Product slug already exists');
      }

      product.slug = slug;
    }

    if (dto.categoryId !== undefined) {
      const category = await this.productsRepository.findCategoryById(
        dto.categoryId,
      );

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      product.categoryId = dto.categoryId;
    }

    if (dto.title !== undefined) {
      product.title = dto.title.trim();
    }

    if (dto.brandName !== undefined) {
      product.brandName = dto.brandName?.trim() || null;
    }

    if (dto.price !== undefined) {
      product.price = dto.price.toFixed(2);
    }

    if (dto.discount !== undefined) {
      product.discount = dto.discount.toFixed(2);
    }

    if (dto.tax !== undefined) {
      product.tax = dto.tax.toFixed(2);
    }

    if (dto.rating !== undefined) {
      product.rating = dto.rating.toFixed(1);
    }

    if (dto.imgUrl !== undefined) {
      product.imgUrl = dto.imgUrl?.trim() || null;
    }

    if (dto.shortDescription !== undefined) {
      product.shortDescription = dto.shortDescription?.trim() || null;
    }

    if (dto.longDescription !== undefined) {
      product.longDescription = dto.longDescription?.trim() || null;
    }

    if (dto.isTrackedInventory !== undefined) {
      product.isTrackedInventory = dto.isTrackedInventory;
    }

    if (dto.status !== undefined) {
      product.status = dto.status;
    }

    const savedProduct = await this.productsRepository.saveProduct(product);

    return this.getProductForAdmin(savedProduct.id);
  }

  async deleteProduct(productId: string): Promise<{ success: true }> {
    const product = await this.productsRepository.findProductById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const cartItemCount =
      await this.productsRepository.countCartItems(productId);

    if (cartItemCount > 0) {
      throw new ConflictException(
        'Product cannot be deleted because it has cart items',
      );
    }

    const orderItemCount =
      await this.productsRepository.countOrderItems(productId);

    if (orderItemCount > 0) {
      throw new ConflictException(
        'Product cannot be deleted because it has order items',
      );
    }

    const inventoryItemCount =
      await this.productsRepository.countInventoryItems(productId);

    if (inventoryItemCount > 0) {
      throw new ConflictException(
        'Product cannot be deleted because it has inventory records',
      );
    }

    const mediaCount = await this.productsRepository.countMedia(productId);

    if (mediaCount > 0) {
      throw new ConflictException(
        'Product cannot be deleted because it has media records',
      );
    }

    const reviewCount = await this.productsRepository.countReviews(productId);

    if (reviewCount > 0) {
      throw new ConflictException(
        'Product cannot be deleted because it has reviews',
      );
    }

    const relationCount =
      await this.productsRepository.countRelations(productId);

    if (relationCount > 0) {
      throw new ConflictException(
        'Product cannot be deleted because it has product relations',
      );
    }

    try {
      await this.productsRepository.removeProduct(product);
    } catch (error) {
      if (
        error instanceof QueryFailedError ||
        (typeof error === 'object' &&
          error !== null &&
          ('driverError' in error || 'code' in error))
      ) {
        throw new ConflictException(
          'Product cannot be deleted because it has related records',
        );
      }

      throw error;
    }

    return { success: true };
  }

  private normalizeSlug(slug: string): string {
    return slug.trim().toLowerCase();
  }
}
