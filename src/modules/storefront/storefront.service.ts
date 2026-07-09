import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { mapProductListItem } from '../../common/mappers/product-list-item.mapper';
import { RecordStatus } from '../../common/enums/record-status.enum';
import { Category } from '../categories/entities/category.entity';
import { Product } from '../products/entities/product.entity';
import { CreateFeaturedCategoryDto } from './dto/create-featured-category.dto';
import { CreateStorefrontCollectionItemDto } from './dto/create-storefront-collection-item.dto';
import { CreateStorefrontCollectionDto } from './dto/create-storefront-collection.dto';
import { UpdateFeaturedCategoryDto } from './dto/update-featured-category.dto';
import { UpdateStorefrontCollectionItemDto } from './dto/update-storefront-collection-item.dto';
import { UpdateStorefrontCollectionDto } from './dto/update-storefront-collection.dto';
import { FeaturedCategory } from './entities/featured-category.entity';
import { StorefrontCollectionItem } from './entities/storefront-collection-item.entity';
import { StorefrontCollection } from './entities/storefront-collection.entity';
import { StorefrontRepository } from './repositories/storefront.repository';

const STATIC_HERO_BANNERS = [
  {
    id: 'hero-1',
    title: '50% Off For Your First Shopping',
    description:
      'Fresh storefront picks, clean product discovery, and quick shopping actions inspired by the active legacy Superstore home.',
    cta: {
      label: 'Shop Now',
      href: '/products',
    },
    image: {
      url: '/assets/superstore/hero-nike-black.png',
      alt: 'Featured storefront campaign',
    },
  },
  {
    id: 'hero-2',
    title: '50% Off For Your First Shopping',
    description:
      'A compact commerce homepage with categories, flash deals, and product recommendations.',
    cta: {
      label: 'Shop Now',
      href: '/products',
    },
    image: {
      url: '/assets/superstore/hero-nike-black.png',
      alt: 'Storefront discovery campaign',
    },
  },
];

@Injectable()
export class StorefrontService {
  constructor(private readonly storefrontRepository: StorefrontRepository) {}

  async getHome() {
    const [featuredCategories, collections] = await Promise.all([
      this.storefrontRepository.findActiveFeaturedCategories(),
      this.storefrontRepository.findActiveCollections(),
    ]);

    return {
      data: {
        heroBanners: STATIC_HERO_BANNERS,
        featuredCategories: featuredCategories.map((item) =>
          this.toHomeFeaturedCategory(item.category),
        ),
        productCollections: collections
          .map((collection) => this.toHomeCollection(collection))
          .filter((collection) => collection.products.length > 0),
      },
    };
  }

  async listFeaturedCategories() {
    const items = await this.storefrontRepository.findFeaturedCategories();

    return {
      items: items.map((item) => this.toAdminFeaturedCategory(item)),
    };
  }

  async createFeaturedCategory(dto: CreateFeaturedCategoryDto) {
    const category = await this.storefrontRepository.findActiveCategoryById(
      dto.categoryId,
    );

    if (!category) {
      throw new NotFoundException('Active category not found');
    }

    const existing =
      await this.storefrontRepository.findFeaturedCategoryByCategoryId(
        dto.categoryId,
      );

    if (existing) {
      throw new ConflictException('Category is already featured');
    }

    const featuredCategory = this.storefrontRepository.createFeaturedCategory({
      categoryId: dto.categoryId,
      sortOrder: dto.sortOrder ?? 0,
      status: dto.status ?? RecordStatus.ACTIVE,
    });

    const saved =
      await this.storefrontRepository.saveFeaturedCategory(featuredCategory);

    const detailed = await this.storefrontRepository.findFeaturedCategoryById(
      saved.id,
    );

    if (!detailed) {
      throw new NotFoundException('Featured category not found');
    }

    return this.toAdminFeaturedCategory(detailed);
  }

  async updateFeaturedCategory(
    featuredCategoryId: string,
    dto: UpdateFeaturedCategoryDto,
  ) {
    const featuredCategory =
      await this.storefrontRepository.findFeaturedCategoryById(
        featuredCategoryId,
      );

    if (!featuredCategory) {
      throw new NotFoundException('Featured category not found');
    }

    if (dto.categoryId !== undefined) {
      const category = await this.storefrontRepository.findActiveCategoryById(
        dto.categoryId,
      );

      if (!category) {
        throw new NotFoundException('Active category not found');
      }

      if (dto.categoryId !== featuredCategory.categoryId) {
        const existing =
          await this.storefrontRepository.findFeaturedCategoryByCategoryId(
            dto.categoryId,
          );

        if (existing) {
          throw new ConflictException('Category is already featured');
        }
      }

      featuredCategory.categoryId = dto.categoryId;
    }

    if (dto.sortOrder !== undefined) {
      featuredCategory.sortOrder = dto.sortOrder;
    }

    if (dto.status !== undefined) {
      featuredCategory.status = dto.status;
    }

    const saved =
      await this.storefrontRepository.saveFeaturedCategory(featuredCategory);

    const detailed = await this.storefrontRepository.findFeaturedCategoryById(
      saved.id,
    );

    if (!detailed) {
      throw new NotFoundException('Featured category not found');
    }

    return this.toAdminFeaturedCategory(detailed);
  }

  async deleteFeaturedCategory(featuredCategoryId: string) {
    const featuredCategory =
      await this.storefrontRepository.findFeaturedCategoryById(
        featuredCategoryId,
      );

    if (!featuredCategory) {
      throw new NotFoundException('Featured category not found');
    }

    await this.storefrontRepository.removeFeaturedCategory(featuredCategory);

    return { success: true };
  }

  async listCollections() {
    const items = await this.storefrontRepository.findCollections();

    return {
      items: items.map((item) => this.toAdminCollection(item)),
    };
  }

  async createCollection(dto: CreateStorefrontCollectionDto) {
    const existing = await this.storefrontRepository.findCollectionByType(
      dto.type,
    );

    if (existing) {
      throw new ConflictException('Storefront collection type already exists');
    }

    const collection = this.storefrontRepository.createCollection({
      type: dto.type,
      title: dto.title.trim(),
      viewAllHref: dto.viewAllHref?.trim() || null,
      sortOrder: dto.sortOrder ?? 0,
      status: dto.status ?? RecordStatus.ACTIVE,
    });

    const saved = await this.storefrontRepository.saveCollection(collection);
    const detailed =
      await this.storefrontRepository.findCollectionByIdWithItems(saved.id);

    if (!detailed) {
      throw new NotFoundException('Storefront collection not found');
    }

    return this.toAdminCollection(detailed);
  }

  async updateCollection(
    collectionId: string,
    dto: UpdateStorefrontCollectionDto,
  ) {
    const collection =
      await this.storefrontRepository.findCollectionById(collectionId);

    if (!collection) {
      throw new NotFoundException('Storefront collection not found');
    }

    if (dto.type !== undefined) {
      const existing =
        await this.storefrontRepository.findAnotherCollectionByType(
          collectionId,
          dto.type,
        );

      if (existing) {
        throw new ConflictException(
          'Storefront collection type already exists',
        );
      }

      collection.type = dto.type;
    }

    if (dto.title !== undefined) {
      collection.title = dto.title.trim();
    }

    if (dto.viewAllHref !== undefined) {
      collection.viewAllHref = dto.viewAllHref?.trim() || null;
    }

    if (dto.sortOrder !== undefined) {
      collection.sortOrder = dto.sortOrder;
    }

    if (dto.status !== undefined) {
      collection.status = dto.status;
    }

    const saved = await this.storefrontRepository.saveCollection(collection);
    const detailed =
      await this.storefrontRepository.findCollectionByIdWithItems(saved.id);

    if (!detailed) {
      throw new NotFoundException('Storefront collection not found');
    }

    return this.toAdminCollection(detailed);
  }

  async deleteCollection(collectionId: string) {
    const collection =
      await this.storefrontRepository.findCollectionByIdWithItems(collectionId);

    if (!collection) {
      throw new NotFoundException('Storefront collection not found');
    }

    for (const item of collection.items ?? []) {
      await this.storefrontRepository.removeCollectionItem(item);
    }

    await this.storefrontRepository.removeCollection(collection);

    return { success: true };
  }

  async listCollectionItems(collectionId: string) {
    const collection =
      await this.storefrontRepository.findCollectionById(collectionId);

    if (!collection) {
      throw new NotFoundException('Storefront collection not found');
    }

    const items =
      await this.storefrontRepository.findCollectionItems(collectionId);

    return {
      items: items.map((item) => this.toAdminCollectionItem(item)),
    };
  }

  async createCollectionItem(
    collectionId: string,
    dto: CreateStorefrontCollectionItemDto,
  ) {
    const collection =
      await this.storefrontRepository.findCollectionById(collectionId);

    if (!collection) {
      throw new NotFoundException('Storefront collection not found');
    }

    const product =
      await this.storefrontRepository.findActiveProductByIdWithCategoryAndInventory(
        dto.productId,
      );

    if (!product) {
      throw new NotFoundException('Active product not found');
    }

    const existing =
      await this.storefrontRepository.findCollectionItemByCollectionAndProduct(
        collectionId,
        dto.productId,
      );

    if (existing) {
      throw new ConflictException('Product is already in the collection');
    }

    const item = this.storefrontRepository.createCollectionItem({
      collectionId,
      productId: dto.productId,
      sortOrder: dto.sortOrder ?? 0,
      status: dto.status ?? RecordStatus.ACTIVE,
    });

    const saved = await this.storefrontRepository.saveCollectionItem(item);
    const detailed = await this.storefrontRepository.findCollectionItemById(
      saved.id,
    );

    if (!detailed) {
      throw new NotFoundException('Storefront collection item not found');
    }

    return this.toAdminCollectionItem(detailed);
  }

  async updateCollectionItem(
    itemId: string,
    dto: UpdateStorefrontCollectionItemDto,
  ) {
    const item = await this.storefrontRepository.findCollectionItemById(itemId);

    if (!item) {
      throw new NotFoundException('Storefront collection item not found');
    }

    if (dto.productId !== undefined) {
      const product =
        await this.storefrontRepository.findActiveProductByIdWithCategoryAndInventory(
          dto.productId,
        );

      if (!product) {
        throw new NotFoundException('Active product not found');
      }

      if (dto.productId !== item.productId) {
        const existing =
          await this.storefrontRepository.findCollectionItemByCollectionAndProduct(
            item.collectionId,
            dto.productId,
          );

        if (existing) {
          throw new ConflictException('Product is already in the collection');
        }
      }

      item.productId = dto.productId;
    }

    if (dto.sortOrder !== undefined) {
      item.sortOrder = dto.sortOrder;
    }

    if (dto.status !== undefined) {
      item.status = dto.status;
    }

    const saved = await this.storefrontRepository.saveCollectionItem(item);
    const detailed = await this.storefrontRepository.findCollectionItemById(
      saved.id,
    );

    if (!detailed) {
      throw new NotFoundException('Storefront collection item not found');
    }

    return this.toAdminCollectionItem(detailed);
  }

  async deleteCollectionItem(itemId: string) {
    const item = await this.storefrontRepository.findCollectionItemById(itemId);

    if (!item) {
      throw new NotFoundException('Storefront collection item not found');
    }

    await this.storefrontRepository.removeCollectionItem(item);

    return { success: true };
  }

  private toHomeFeaturedCategory(category: Category) {
    return {
      id: category.id,
      slug: category.slug,
      name: category.name,
      image: {
        url: category.imgUrl,
        alt: `${category.name} category`,
      },
    };
  }

  private toHomeCollection(collection: StorefrontCollection) {
    const items = (collection.items ?? [])
      .filter(
        (item) =>
          item.status === RecordStatus.ACTIVE &&
          item.product?.status === RecordStatus.ACTIVE &&
          item.product.category?.status === RecordStatus.ACTIVE,
      )
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => this.toHomeProduct(item.product));

    return {
      id: collection.id,
      title: collection.title,
      type: collection.type,
      viewAllHref: collection.viewAllHref,
      products: items,
    };
  }

  private toHomeProduct(product: Product) {
    const mapped = mapProductListItem(product);

    return {
      id: mapped.id,
      slug: mapped.slug,
      title: mapped.title,
      brandName: mapped.brandName,
      categorySlug: product.category.slug,
      price: mapped.price,
      discount: mapped.discount,
      tax: mapped.tax,
      rating: mapped.rating,
      image: {
        url: mapped.imgUrl,
        alt: mapped.title,
      },
      shortDescription: mapped.shortDescription,
    };
  }

  private toAdminFeaturedCategory(item: FeaturedCategory) {
    return {
      id: item.id,
      categoryId: item.categoryId,
      sortOrder: item.sortOrder,
      status: item.status,
      category: {
        id: item.category.id,
        parentId: item.category.parentId,
        slug: item.category.slug,
        name: item.category.name,
        imgUrl: item.category.imgUrl,
        sortOrder: item.category.sortOrder,
        status: item.category.status,
      },
    };
  }

  private toAdminCollectionItem(item: StorefrontCollectionItem) {
    return {
      id: item.id,
      collectionId: item.collectionId,
      productId: item.productId,
      sortOrder: item.sortOrder,
      status: item.status,
      product: {
        ...mapProductListItem(item.product),
        categorySlug: item.product.category?.slug ?? null,
      },
    };
  }

  private toAdminCollection(collection: StorefrontCollection) {
    return {
      id: collection.id,
      type: collection.type,
      title: collection.title,
      viewAllHref: collection.viewAllHref,
      sortOrder: collection.sortOrder,
      status: collection.status,
      items: (collection.items ?? [])
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item) => this.toAdminCollectionItem(item)),
    };
  }
}
