// src/modules/products/repositories/products.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { RecordStatus } from '../../../common/enums/record-status.enum';
import { CartItem } from '../../cart/entities/cart-item.entity';
import { Category } from '../../categories/entities/category.entity';
import { ProductMedia } from '../../product-media/entities/product-media.entity';
import { ProductRelation } from '../../product-relations/entities/product-relation.entity';
import { ProductReview } from '../../product-reviews/entities/product-review.entity';
import { ListAdminProductsQueryDto } from '../dto/list-admin-products-query.dto';
import { ListProductsQueryDto } from '../dto/list-products-query.dto';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  findCategoryById(categoryId: string): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: { id: categoryId },
    });
  }

  async findProducts(
    query: ListProductsQueryDto,
  ): Promise<[Product[], number]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.category', 'category')
      .where('product.status = :status', { status: RecordStatus.ACTIVE })
      .andWhere('category.status = :categoryStatus', {
        categoryStatus: RecordStatus.ACTIVE,
      })
      .orderBy('product.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.categorySlug) {
      qb.andWhere('category.slug = :categorySlug', {
        categorySlug: query.categorySlug,
      });
    }

    if (query.search) {
      qb.andWhere('LOWER(product.title) LIKE LOWER(:search)', {
        search: `%${query.search}%`,
      });
    }

    return qb.getManyAndCount();
  }

  async findProductsForAdmin(
    query: ListAdminProductsQueryDto,
  ): Promise<[Product[], number]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.category', 'category')
      .orderBy('product.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.categorySlug) {
      qb.andWhere('category.slug = :categorySlug', {
        categorySlug: query.categorySlug,
      });
    }

    if (query.status) {
      qb.andWhere('product.status = :status', {
        status: query.status,
      });
    }

    if (query.search) {
      qb.andWhere('LOWER(product.title) LIKE LOWER(:search)', {
        search: `%${query.search}%`,
      });
    }

    return qb.getManyAndCount();
  }

  findProductById(productId: string): Promise<Product | null> {
    return this.productRepository.findOne({
      where: { id: productId },
    });
  }

  findPublicProductById(productId: string): Promise<Product | null> {
    return this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.category', 'category')
      .where('product.id = :productId', { productId })
      .andWhere('product.status = :status', { status: RecordStatus.ACTIVE })
      .andWhere('category.status = :categoryStatus', {
        categoryStatus: RecordStatus.ACTIVE,
      })
      .getOne();
  }

  findProductBySlug(slug: string): Promise<Product | null> {
    return this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.media', 'media')
      .leftJoinAndSelect('product.sourceRelations', 'sourceRelations')
      .leftJoinAndSelect(
        'sourceRelations.targetProduct',
        'targetProduct',
        'targetProduct.status = :activeStatus',
        { activeStatus: RecordStatus.ACTIVE },
      )
      .where('product.slug = :slug', { slug })
      .andWhere('product.status = :status', { status: RecordStatus.ACTIVE })
      .andWhere('category.status = :categoryStatus', {
        categoryStatus: RecordStatus.ACTIVE,
      })
      .getOne();
  }

  findProductBySlugPlain(slug: string): Promise<Product | null> {
    return this.productRepository.findOne({
      where: { slug },
    });
  }

  findAnotherProductBySlug(
    productId: string,
    slug: string,
  ): Promise<Product | null> {
    return this.productRepository.findOne({
      where: {
        id: Not(productId),
        slug,
      },
    });
  }

  createProduct(data: Partial<Product>): Product {
    return this.productRepository.create(data);
  }

  saveProduct(product: Product): Promise<Product> {
    return this.productRepository.save(product);
  }

  async removeProduct(product: Product): Promise<void> {
    await this.productRepository.remove(product);
  }

  countCartItems(productId: string): Promise<number> {
    return this.productRepository.manager.getRepository(CartItem).count({
      where: {
        productId,
      },
    });
  }

  countMedia(productId: string): Promise<number> {
    return this.productRepository.manager.getRepository(ProductMedia).count({
      where: {
        productId,
      },
    });
  }

  countReviews(productId: string): Promise<number> {
    return this.productRepository.manager.getRepository(ProductReview).count({
      where: {
        productId,
      },
    });
  }

  countRelations(productId: string): Promise<number> {
    return this.productRepository.manager.getRepository(ProductRelation).count({
      where: [{ sourceProductId: productId }, { targetProductId: productId }],
    });
  }
}
