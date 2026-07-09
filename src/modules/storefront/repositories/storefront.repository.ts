import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecordStatus } from '../../../common/enums/record-status.enum';
import { Category } from '../../categories/entities/category.entity';
import { Product } from '../../products/entities/product.entity';
import { FeaturedCategory } from '../entities/featured-category.entity';
import { StorefrontCollectionType } from '../enums/storefront-collection-type.enum';
import { StorefrontCollectionItem } from '../entities/storefront-collection-item.entity';
import { StorefrontCollection } from '../entities/storefront-collection.entity';

@Injectable()
export class StorefrontRepository {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(FeaturedCategory)
    private readonly featuredCategoryRepository: Repository<FeaturedCategory>,
    @InjectRepository(StorefrontCollection)
    private readonly storefrontCollectionRepository: Repository<StorefrontCollection>,
    @InjectRepository(StorefrontCollectionItem)
    private readonly storefrontCollectionItemRepository: Repository<StorefrontCollectionItem>,
  ) {}

  findCategoryById(categoryId: string): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: { id: categoryId },
    });
  }

  findActiveCategoryById(categoryId: string): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: {
        id: categoryId,
        status: RecordStatus.ACTIVE,
      },
    });
  }

  findActiveCategoryBySlug(slug: string): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: {
        slug,
        status: RecordStatus.ACTIVE,
      },
    });
  }

  findProductByIdWithCategoryAndInventory(
    productId: string,
  ): Promise<Product | null> {
    return this.productRepository.findOne({
      where: { id: productId },
      relations: {
        category: true,
        inventoryItems: true,
      },
    });
  }

  findActiveProductByIdWithCategoryAndInventory(
    productId: string,
  ): Promise<Product | null> {
    return this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.inventoryItems', 'inventoryItems')
      .where('product.id = :productId', { productId })
      .andWhere('product.status = :productStatus', {
        productStatus: RecordStatus.ACTIVE,
      })
      .andWhere('category.status = :categoryStatus', {
        categoryStatus: RecordStatus.ACTIVE,
      })
      .getOne();
  }

  findActiveProductBySlugWithCategoryAndInventory(
    slug: string,
  ): Promise<Product | null> {
    return this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.inventoryItems', 'inventoryItems')
      .where('product.slug = :slug', { slug })
      .andWhere('product.status = :productStatus', {
        productStatus: RecordStatus.ACTIVE,
      })
      .andWhere('category.status = :categoryStatus', {
        categoryStatus: RecordStatus.ACTIVE,
      })
      .getOne();
  }

  findFeaturedCategoryById(
    featuredCategoryId: string,
  ): Promise<FeaturedCategory | null> {
    return this.featuredCategoryRepository.findOne({
      where: { id: featuredCategoryId },
      relations: {
        category: true,
      },
    });
  }

  findFeaturedCategoryByCategoryId(
    categoryId: string,
  ): Promise<FeaturedCategory | null> {
    return this.featuredCategoryRepository.findOne({
      where: { categoryId },
    });
  }

  findFeaturedCategories(): Promise<FeaturedCategory[]> {
    return this.featuredCategoryRepository.find({
      relations: {
        category: true,
      },
      order: {
        sortOrder: 'ASC',
        createdAt: 'ASC',
      },
    });
  }

  findActiveFeaturedCategories(): Promise<FeaturedCategory[]> {
    return this.featuredCategoryRepository.find({
      where: {
        status: RecordStatus.ACTIVE,
        category: {
          status: RecordStatus.ACTIVE,
        },
      },
      relations: {
        category: true,
      },
      order: {
        sortOrder: 'ASC',
        createdAt: 'ASC',
      },
    });
  }

  createFeaturedCategory(data: Partial<FeaturedCategory>): FeaturedCategory {
    return this.featuredCategoryRepository.create(data);
  }

  saveFeaturedCategory(
    featuredCategory: FeaturedCategory,
  ): Promise<FeaturedCategory> {
    return this.featuredCategoryRepository.save(featuredCategory);
  }

  async removeFeaturedCategory(
    featuredCategory: FeaturedCategory,
  ): Promise<void> {
    await this.featuredCategoryRepository.remove(featuredCategory);
  }

  findCollectionById(
    collectionId: string,
  ): Promise<StorefrontCollection | null> {
    return this.storefrontCollectionRepository.findOne({
      where: { id: collectionId },
    });
  }

  findCollectionByIdWithItems(
    collectionId: string,
  ): Promise<StorefrontCollection | null> {
    return this.storefrontCollectionRepository.findOne({
      where: { id: collectionId },
      relations: {
        items: {
          product: {
            category: true,
            inventoryItems: true,
          },
        },
      },
    });
  }

  findCollectionByType(
    type: StorefrontCollectionType,
  ): Promise<StorefrontCollection | null> {
    return this.storefrontCollectionRepository.findOne({
      where: { type },
    });
  }

  findAnotherCollectionByType(
    collectionId: string,
    type: StorefrontCollectionType,
  ): Promise<StorefrontCollection | null> {
    return this.storefrontCollectionRepository
      .createQueryBuilder('collection')
      .where('collection.id != :collectionId', { collectionId })
      .andWhere('collection.type = :type', { type })
      .getOne();
  }

  findCollections(): Promise<StorefrontCollection[]> {
    return this.storefrontCollectionRepository.find({
      relations: {
        items: {
          product: {
            category: true,
            inventoryItems: true,
          },
        },
      },
      order: {
        sortOrder: 'ASC',
        createdAt: 'ASC',
        items: {
          sortOrder: 'ASC',
          createdAt: 'ASC',
        },
      },
    });
  }

  findActiveCollections(): Promise<StorefrontCollection[]> {
    return this.storefrontCollectionRepository.find({
      where: {
        status: RecordStatus.ACTIVE,
      },
      relations: {
        items: {
          product: {
            category: true,
            inventoryItems: true,
          },
        },
      },
      order: {
        sortOrder: 'ASC',
        createdAt: 'ASC',
        items: {
          sortOrder: 'ASC',
          createdAt: 'ASC',
        },
      },
    });
  }

  createCollection(data: Partial<StorefrontCollection>): StorefrontCollection {
    return this.storefrontCollectionRepository.create(data);
  }

  saveCollection(
    collection: StorefrontCollection,
  ): Promise<StorefrontCollection> {
    return this.storefrontCollectionRepository.save(collection);
  }

  async removeCollection(collection: StorefrontCollection): Promise<void> {
    await this.storefrontCollectionRepository.remove(collection);
  }

  findCollectionItemById(
    itemId: string,
  ): Promise<StorefrontCollectionItem | null> {
    return this.storefrontCollectionItemRepository.findOne({
      where: { id: itemId },
      relations: {
        product: {
          category: true,
          inventoryItems: true,
        },
      },
    });
  }

  findCollectionItemByCollectionAndProduct(
    collectionId: string,
    productId: string,
  ): Promise<StorefrontCollectionItem | null> {
    return this.storefrontCollectionItemRepository.findOne({
      where: {
        collectionId,
        productId,
      },
    });
  }

  findCollectionItems(
    collectionId: string,
  ): Promise<StorefrontCollectionItem[]> {
    return this.storefrontCollectionItemRepository.find({
      where: { collectionId },
      relations: {
        product: {
          category: true,
          inventoryItems: true,
        },
      },
      order: {
        sortOrder: 'ASC',
        createdAt: 'ASC',
      },
    });
  }

  createCollectionItem(
    data: Partial<StorefrontCollectionItem>,
  ): StorefrontCollectionItem {
    return this.storefrontCollectionItemRepository.create(data);
  }

  saveCollectionItem(
    item: StorefrontCollectionItem,
  ): Promise<StorefrontCollectionItem> {
    return this.storefrontCollectionItemRepository.save(item);
  }

  async removeCollectionItem(item: StorefrontCollectionItem): Promise<void> {
    await this.storefrontCollectionItemRepository.remove(item);
  }
}
